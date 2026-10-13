import { expect, test } from '@playwright/test'

const run = Date.now()
const host = { name: 'E2E Clay Studio', email: `host-${run}@example.com` }
const first = { name: 'E2E Arjun', email: `arjun-${run}@example.com` }
const second = { name: 'E2E Priya', email: `priya-${run}@example.com` }
const PASSWORD = 'e2e-password-1'
const TITLE = `E2E Wheel Throwing ${run}`

async function signUp(page, user, role) {
  await page.goto('/login?mode=signup')
  if (role === 'host') await page.getByRole('button', { name: /Host a Workshop/ }).click()
  await page.getByPlaceholder('Full name').fill(user.name)
  await page.getByPlaceholder('Email').fill(user.email)
  await page.getByPlaceholder(/Password/).fill(PASSWORD)
  await page.getByRole('button', { name: /Create .* Account/ }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

async function logIn(page, user) {
  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(user.email)
  await page.getByPlaceholder(/Password/).fill(PASSWORD)
  await page.getByRole('button', { name: 'Log In' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

function nextWeek() {
  const d = new Date(Date.now() + 7 * 864e5)
  d.setHours(10, 0, 0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

test.describe.serial('host lists a workshop, learners book, cancel promotes the waitlist', () => {
  let workshopUrl

  test('host signs up and publishes a one-seat workshop', async ({ page }) => {
    await signUp(page, host, 'host')
    await expect(page.getByRole('heading', { name: 'Host Dashboard' })).toBeVisible()
    await page.getByRole('link', { name: /Create New Workshop/ }).click()
    await page.getByPlaceholder('Pottery Basics Workshop').fill(TITLE)
    await page.getByLabel('Date & time').fill(nextWeek())
    await page.getByLabel('Price per person (₹)').fill('1500')
    await page.getByLabel('Capacity (seats)').fill('1')
    await page.getByRole('button', { name: 'Publish workshop' }).click()
    await expect(page.getByRole('heading', { name: TITLE })).toBeVisible()
    await expect(page.getByText('1 seat remaining')).toBeVisible()
    workshopUrl = page.url()
  })

  test('first learner books the only seat and gets a booking reference', async ({ page }) => {
    await signUp(page, first, 'learner')
    await page.goto(workshopUrl)
    await page.getByRole('button', { name: 'Register Now' }).click()
    await expect(page.getByRole('heading', { name: "You're confirmed!" })).toBeVisible()
    await expect(page.getByTestId('booking-ref')).toContainText('KAL-')
  })

  test('second learner sees the session is full and joins the waitlist', async ({ page }) => {
    await signUp(page, second, 'learner')
    await page.goto(workshopUrl)
    await expect(page.getByText('Fully booked')).toBeVisible()
    await page.getByRole('button', { name: 'Add to Waitlist' }).click()
    await expect(page.getByText(/You are #1 on the waitlist/)).toBeVisible()
  })

  test('first learner cancels and the seat goes to the waitlisted learner', async ({ page }) => {
    await logIn(page, first)
    await page.goto('/bookings')
    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: 'Cancel booking' }).click()
    await expect(page.getByText(/offered to the next learner on the waitlist/)).toBeVisible()

    await page.getByRole('button', { name: /E2E/ }).click() // log out
    await logIn(page, second)
    await page.goto('/bookings')
    await expect(page.locator('.booking-row').filter({ hasText: TITLE })).toContainText('Confirmed')
  })

  test('host dashboard reflects the live registration count', async ({ page }) => {
    await logIn(page, host)
    const row = page.getByTestId('host-row').filter({ hasText: TITLE })
    await expect(row).toContainText('1/1 registered')
    await row.getByRole('button', { name: 'View Registrations' }).click()
    await expect(page.locator('.attendees')).toContainText(second.name)
  })
})
