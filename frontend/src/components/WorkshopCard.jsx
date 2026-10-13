import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Star } from 'lucide-react'
import CategoryArt from './CategoryArt.jsx'
import { formatDate, formatDuration, formatPrice, seatLabel } from '../lib/format.js'

export default function WorkshopCard({ workshop }) {
  const label = seatLabel(workshop)
  const tone = workshop.seats_left === 0 ? 'red' : workshop.seats_left <= 2 ? 'amber' : 'green'
  return (
    <article className="workshop-card" data-testid="workshop-card">
      <CategoryArt category={workshop.category} height={130}>
        <span className={`seat-pill ${tone}`}>{label}</span>
      </CategoryArt>
      <div className="workshop-card-body">
        <h3>{workshop.title}</h3>
        <p className="muted small">by {workshop.host_name}</p>
        <p className="meta"><MapPin size={14} /> {[workshop.area, workshop.city].filter(Boolean).join(', ')}</p>
        <div className="meta-row">
          <span className="meta"><CalendarDays size={14} /> {formatDate(workshop.date_time)}</span>
          <span className="meta"><Clock size={14} /> {formatDuration(workshop.duration_minutes)}</span>
        </div>
        <div className="meta-row">
          <strong className="price">{formatPrice(workshop.price)}</strong>
          {workshop.avg_rating && (
            <span className="meta"><Star size={14} className="star on" /> {workshop.avg_rating} ({workshop.review_count})</span>
          )}
        </div>
        <Link className="btn btn-soft btn-block" to={`/workshops/${workshop.id}`}>View Details</Link>
      </div>
    </article>
  )
}
