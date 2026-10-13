import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, CalendarDays, Clock, Info, MapPin, Signal } from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { formatDate, formatDuration, formatPrice, formatTime } from '../lib/format.js'
import CategoryArt from '../components/CategoryArt.jsx'
import SeatMeter from '../components/SeatMeter.jsx'
import StarRating from '../components/StarRating.jsx'

export default function WorkshopDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workshop, setWorkshop] = useState(null)
  const [reviews, setReviews] = useState([])
  const [mine, setMine] = useState(null) // this learner's registration or waitlist entry
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  async function load() {
    try {
      const [w, r] = await Promise.all([api.get(`/workshops/${id}`), api.get(`/workshops/${id}/reviews/`)])
      setWorkshop(w.data)
      setReviews(r.data)
      if (user?.role === 'learner') {
        const b = await api.get('/registrations/me')
        setMine(b.data.find((x) => x.workshop.id === Number(id) && x.status !== 'cancelled') || null)
      }
    } catch (err) {
      setError(errorMessage(err, 'Workshop not found.'))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  async function register() {
    if (!user) return navigate('/login')
    setBusy(true)
    setNotice(null)
    try {
      const res = await api.post(`/workshops/${id}/register`)
      if (res.data.status === 'confirmed') {
        navigate('/bookings/confirmed', { state: { registration: res.data.registration, workshop } })
      } else {
        setNotice(`This session is full. You are #${res.data.waitlist_position} on the waitlist and will get the next free seat automatically.`)
        load()
      }
    } catch (err) {
      setNotice(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    try {
      await api.post(`/workshops/${id}/reviews/`, { rating, comment })
      setComment('')
      setNotice('Thanks for your review!')
      load()
    } catch (err) {
      setNotice(errorMessage(err))
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!workshop) return <p>Loading...</p>

  const full = workshop.seats_left === 0
  const ended = new Date(workshop.date_time) <= new Date()
  const reviewed = reviews.some((r) => r.learner_id === user?.id)
  let action
  if (workshop.status === 'cancelled') action = <button className="btn btn-block" disabled>Workshop cancelled</button>
  else if (ended && mine?.kind !== 'registration') action = <button className="btn btn-block" disabled>This session has ended</button>
  else if (mine?.kind === 'registration') action = <Link className="btn btn-soft btn-block" to="/bookings">You're booked · {mine.booking_ref}</Link>
  else if (mine?.kind === 'waitlist') action = <Link className="btn btn-soft btn-block" to="/bookings">On waitlist · position #{mine.waitlist_position}</Link>
  else if (user && user.role !== 'learner') action = <button className="btn btn-block" disabled>Log in as a learner to book</button>
  else action = (
    <button className={`btn btn-block ${full ? 'btn-dark' : 'btn-primary'}`} onClick={register} disabled={busy}>
      {full ? 'Add to Waitlist' : 'Register Now'}
    </button>
  )

  return (
    <div className="detail">
      <CategoryArt category={workshop.category} height={240} />
      <div className="detail-grid">
        <div>
          <span className="tag">{workshop.category}</span>
          <h1>{workshop.title}</h1>
          <p className="host-line">
            by <strong>{workshop.host_name}</strong>
            {workshop.host_verified && <span className="verified"><BadgeCheck size={15} /> Verified Host</span>}
            {workshop.avg_rating && <span className="meta"><StarRating value={workshop.avg_rating} /> {workshop.avg_rating} ({workshop.review_count} reviews)</span>}
          </p>
          <ul className="facts">
            <li><CalendarDays size={17} /> {formatDate(workshop.date_time)}</li>
            <li><Clock size={17} /> {formatTime(workshop.date_time)} · {formatDuration(workshop.duration_minutes)}</li>
            <li><MapPin size={17} /> {[workshop.area, workshop.city].filter(Boolean).join(', ')}</li>
            <li><Signal size={17} /> {workshop.skill_level}</li>
          </ul>
          <h3>About this workshop</h3>
          <p className="description">{workshop.description || 'The host has not added a description yet.'}</p>

          <h3>Reviews {workshop.avg_rating && <span className="muted">({workshop.avg_rating} ★)</span>}</h3>
          {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          {reviews.map((r) => (
            <div className="review" key={r.id}>
              <div><strong>{r.learner_name}</strong> <StarRating value={r.rating} size={13} /></div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
          {mine?.kind === 'registration' && ended && !reviewed && (
            <form className="review-form" onSubmit={submitReview}>
              <h4>Rate this session</h4>
              <StarRating value={rating} size={22} onChange={setRating} />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you enjoy?" />
              <button className="btn btn-primary" type="submit">Submit review</button>
            </form>
          )}
        </div>

        <aside className="booking-box">
          <div className="price-line">
            <strong>{formatPrice(workshop.price)}</strong><span>per person · pay at venue</span>
          </div>
          <SeatMeter capacity={workshop.capacity} seatsFilled={workshop.seats_filled} />
          {full && workshop.waitlist_count > 0 && (
            <p className="small muted">{workshop.waitlist_count} learner{workshop.waitlist_count === 1 ? '' : 's'} on the waitlist</p>
          )}
          {action}
          {notice && <p className="notice"><Info size={16} /> {notice}</p>}
        </aside>
      </div>
    </div>
  )
}
