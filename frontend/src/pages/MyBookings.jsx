import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { formatDate, formatTime } from '../lib/format.js'
import CategoryArt from '../components/CategoryArt.jsx'

export default function MyBookings() {
  const [items, setItems] = useState(null)
  const [message, setMessage] = useState(null)

  const load = () => api.get('/registrations/me').then((res) => setItems(res.data)).catch((e) => setMessage(errorMessage(e)))
  useEffect(() => {
    load()
  }, [])

  async function cancel(item) {
    if (!window.confirm(`Cancel your seat in "${item.workshop.title}"?`)) return
    try {
      const res = await api.post(`/registrations/${item.registration_id}/cancel`)
      setMessage(res.data.status === 'seat reassigned'
        ? 'Booking cancelled. Your seat has been offered to the next learner on the waitlist.'
        : 'Booking cancelled. The seat is open again.')
      load()
    } catch (e) {
      setMessage(errorMessage(e))
    }
  }

  async function leave(item) {
    try {
      await api.delete(`/workshops/${item.workshop.id}/waitlist`)
      setMessage('You have left the waitlist.')
      load()
    } catch (e) {
      setMessage(errorMessage(e))
    }
  }

  if (!items) return <p>Loading your bookings...</p>

  return (
    <div>
      <h2>My Bookings</h2>
      {message && <p className="notice">{message}</p>}
      {items.length === 0 && (
        <p className="muted">No bookings yet. <Link to="/workshops">Find a workshop</Link></p>
      )}
      <div className="booking-list">
        {items.map((item) => (
          <div className={`booking-row ${item.status}`} key={`${item.kind}-${item.registration_id ?? item.workshop.id}`}>
            <CategoryArt category={item.workshop.category} height={84} />
            <div className="booking-row-main">
              <Link to={`/workshops/${item.workshop.id}`}><h3>{item.workshop.title}</h3></Link>
              <p className="meta"><CalendarDays size={14} /> {formatDate(item.workshop.date_time)}, {formatTime(item.workshop.date_time)}</p>
              <p className="meta"><MapPin size={14} /> {[item.workshop.area, item.workshop.city].filter(Boolean).join(', ')}</p>
            </div>
            <div className="booking-row-side">
              {item.kind === 'registration' ? (
                <>
                  <span className={`status-badge ${item.status}`}>{item.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</span>
                  <span className="meta"><Ticket size={14} /> {item.booking_ref}</span>
                  {item.status === 'confirmed' && <button className="btn btn-outline btn-sm" onClick={() => cancel(item)}>Cancel booking</button>}
                </>
              ) : (
                <>
                  <span className="status-badge waitlisted">Waitlist #{item.waitlist_position}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => leave(item)}>Leave waitlist</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
