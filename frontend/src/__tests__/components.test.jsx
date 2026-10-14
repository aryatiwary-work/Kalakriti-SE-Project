import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SeatMeter from '../components/SeatMeter.jsx'
import WorkshopCard from '../components/WorkshopCard.jsx'

const workshop = {
  id: 7, title: 'Pottery Basics Workshop', host_name: 'Clay Studio', category: 'Pottery', city: 'Chennai',
  area: 'Alwarpet', date_time: '2026-10-24T10:00:00', duration_minutes: 180, price: 1200, capacity: 12,
  seats_filled: 10, seats_left: 2, status: 'active', avg_rating: 4.7, review_count: 3,
}

describe('SeatMeter', () => {
  it('shows remaining seats and filled count', () => {
    render(<SeatMeter capacity={12} seatsFilled={8} />)
    expect(screen.getByText('4 seats remaining')).toBeInTheDocument()
    expect(screen.getByText('8/12 seats filled')).toBeInTheDocument()
  })
  it('switches to fully booked at capacity', () => {
    render(<SeatMeter capacity={5} seatsFilled={5} />)
    expect(screen.getByText('Fully booked')).toBeInTheDocument()
  })
})

describe('WorkshopCard', () => {
  it('renders the listing summary and links to the detail page', () => {
    render(<MemoryRouter><WorkshopCard workshop={workshop} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Pottery Basics Workshop' })).toBeInTheDocument()
    expect(screen.getByText('by Clay Studio')).toBeInTheDocument()
    expect(screen.getByText('2 seats left')).toHaveClass('amber')
    expect(screen.getByText('₹1,200')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute('href', '/workshops/7')
  })
  it('shows waitlist pill in red when full', () => {
    render(<MemoryRouter><WorkshopCard workshop={{ ...workshop, seats_left: 0, seats_filled: 12 }} /></MemoryRouter>)
    expect(screen.getByText('Waitlist open')).toHaveClass('red')
  })
})
