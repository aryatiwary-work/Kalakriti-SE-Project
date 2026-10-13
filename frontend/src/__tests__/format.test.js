import { describe, expect, it } from 'vitest'
import { formatDuration, formatPrice, seatLabel } from '../lib/format.js'

describe('seatLabel', () => {
  it('shows remaining seats, singular and waitlist states', () => {
    expect(seatLabel({ status: 'active', seats_left: 4 })).toBe('4 seats left')
    expect(seatLabel({ status: 'active', seats_left: 1 })).toBe('1 seat left')
    expect(seatLabel({ status: 'active', seats_left: 0 })).toBe('Waitlist open')
    expect(seatLabel({ status: 'cancelled', seats_left: 3 })).toBe('Cancelled')
  })
})

describe('formatters', () => {
  it('formats prices in rupees and marks free sessions', () => {
    expect(formatPrice(1200)).toBe('₹1,200')
    expect(formatPrice(0)).toBe('Free')
  })
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 hr')
    expect(formatDuration(150)).toBe('2.5 hrs')
    expect(formatDuration(180)).toBe('3 hrs')
  })
})
