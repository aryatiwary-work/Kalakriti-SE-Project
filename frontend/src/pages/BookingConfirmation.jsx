import { Link, Navigate, useLocation } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Clock, Mail, MapPin, Ticket } from 'lucide-react'
import CategoryArt from '../components/CategoryArt.jsx'
import { formatDate, formatDuration, formatTime } from '../lib/format.js'

export default function BookingConfirmation() {
  const { state } = useLocation()
  if (!state?.registration) return <Navigate to="/bookings" replace />
  const { registration, workshop } = state

  return (
    <div className="confirm">
      <CheckCircle2 size={64} className="confirm-icon" />
      <h1>You're confirmed!</h1>
      <p className="muted">Your spot is booked. We can't wait to see you!</p>

      <div className="confirm-card">
        <CategoryArt category={workshop.category} height={110} />
        <div>
          <h3>{workshop.title}</h3>
          <p className="muted small">by {workshop.host_name}</p>
          <p className="meta"><CalendarDays size={14} /> {formatDate(workshop.date_time)}</p>
          <p className="meta"><Clock size={14} /> {formatTime(workshop.date_time)} · {formatDuration(workshop.duration_minutes)}</p>
          <p className="meta"><MapPin size={14} /> {[workshop.area, workshop.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="booking-ref">
        <span>Booking Reference</span>
        <strong data-testid="booking-ref"><Ticket size={18} /> {registration.booking_ref}</strong>
      </div>
      <p className="notice"><Mail size={16} /> Show this reference at the venue. Payment is cash/UPI on arrival.</p>
      <div className="confirm-actions">
        <Link className="btn btn-primary" to="/bookings">View in My Bookings</Link>
        <Link className="btn btn-outline" to="/workshops">Explore More Workshops</Link>
      </div>
    </div>
  )
}
