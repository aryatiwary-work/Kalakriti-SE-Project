import { expect, test } from '@playwright/test'

test('landing page shows the hero, live stats, categories and FAQ', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Learn a craft/ })).toBeVisible()
  await expect(page.getByText('Upcoming workshops', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Pottery/ })).toBeVisible()
  const faq = page.locator('#faq details').first()
  await faq.locator('summary').click()
  await expect(faq).toHaveAttribute('open', '')
  await page.getByRole('button', { name: /Pottery/ }).click()
  await expect(page).toHaveURL(/category=Pottery/)
})

test('about page and 404 page render', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: 'The makers' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Devansh Kalwani' })).toBeVisible()
  await page.goto('/this-page-does-not-exist')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await page.getByRole('link', { name: /Back home/ }).click()
  await expect(page).toHaveURL(/\/$/)
})
