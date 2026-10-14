// Component-integration test: Search page + router + API client (mocked at the HTTP boundary).
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/api.js', () => ({
  default: { get: vi.fn() },
  errorMessage: () => 'error',
}))

import api from '../lib/api.js'
import Search from '../pages/Search.jsx'

const sample = (id, title) => ({
  id, title, host_name: 'Clay Studio', category: 'Pottery', city: 'Chennai', area: null,
  date_time: '2026-10-24T10:00:00', duration_minutes: 120, price: 1000, capacity: 10,
  seats_filled: 2, seats_left: 8, status: 'active', avg_rating: null, review_count: 0,
})

function renderAt(url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes><Route path="/workshops" element={<Search />} /></Routes>
    </MemoryRouter>,
  )
}

describe('Search page', () => {
  beforeEach(() => api.get.mockReset())

  it('sends URL filters to the API and lists results', async () => {
    api.get.mockResolvedValue({ data: [sample(1, 'Pottery Basics'), sample(2, 'Wheel Throwing')] })
    renderAt('/workshops?city=Chennai&category=Pottery')
    await waitFor(() => expect(screen.getByText('2 workshops found')).toBeInTheDocument())
    expect(api.get).toHaveBeenCalledWith('/workshops/', { params: { city: 'Chennai', category: 'Pottery' } })
    expect(screen.getAllByTestId('workshop-card')).toHaveLength(2)
  })

  it('shows active filters as removable chips', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderAt('/workshops?city=Chennai&category=Pottery')
    const chips = await screen.findByTestId('active-filters')
    expect(chips).toHaveTextContent('City: Chennai')
    expect(chips).toHaveTextContent('Category: Pottery')

    fireEvent.click(screen.getByLabelText('remove category'))
    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith('/workshops/', { params: { city: 'Chennai' } }),
    )
    expect(screen.getByText(/No workshops match/)).toBeInTheDocument()
  })
})
