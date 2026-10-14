import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CalendarDays, Copy, LayoutGrid, Pencil, Plus, Star, Users, XCircle } from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { formatDate, formatTime } from '../lib/format.js'
import CategoryArt from '../components/CategoryArt.jsx'

function Tile({ icon: Icon, value, label }) {
  return (
    <div className="tile">
      <Icon size={20} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function HostDashboard() {
  const [data, setData] = useState(null)
  const [open, setOpen] = useState(null)
  const [attendees, setAttendees] = useState(null)
  const [message, setMessage] = useState(null)

  const load = () => api.get('/hosts/me/dashboard').then((res) => setData(res.data)).catch((e) => setMessage(errorMessage(e)))
  useEffect(() => {
    load()
  }, [])

  async function toggleAttendees(id) {
    if (open === id) return setOpen(null)
    setOpen(id)
    setAttendees(null)
    const res = await api.get(`/workshops/${id}/attendees`)
    setAttendees(res.data)
  }

  async function cancelWorkshop(w) {
    if (!window.confirm(`Cancel "${w.title}"? All bookings will be released.`)) return
    await api.post(`/workshops/${w.id}/cancel`)
    setMessage(`"${w.title}" was cancelled.`)
    load()
  }

  async function duplicate(w) {
    const next = new Date(w.date_time)
    next.setDate(next.getDate() + 7)
    if (next < new Date()) next.setTime(Date.now() + 7 * 864e5)
    const iso = new Date(next.getTime() - next.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    try {
      await api.post(`/workshops/${w.id}/duplicate`, { date_time: iso })
      setMessage(`"${w.title}" was duplicated for ${formatDate(next)}.`)
      load()
    } catch (e) {
      setMessage(errorMessage(e))
    }
  }

  if (!data) return <p>{message || 'Loading dashboard...'}</p>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Host Dashboard</h2>
          <p className="muted">
            Welcome back, {data.host.name}
            {data.host.is_verified && <span className="verified"><BadgeCheck size={15} /> Verified Host</span>}
          </p>
        </div>
        <Link className="btn btn-primary" to="/host/new"><Plus size={16} /> Create New Workshop</Link>
      </div>

      <div className="tiles">
        <Tile icon={Users} value={data.total_registrations} label="Total Registrations" />
        <Tile icon={LayoutGrid} value={data.active_workshops} label="Active Workshops" />
        <Tile icon={CalendarDays} value={data.upcoming_sessions} label="Upcoming" />
        <Tile icon={Star} value={data.host_rating ?? '–'} label="Host Rating" />
      </div>
      {message && <p className="notice">{message}</p>}

      <h3>My Workshops</h3>
      {data.workshops.length === 0 && <p className="muted">You have not listed any workshops yet.</p>}
      <div className="host-list">
        {data.workshops.map(({ workshop: w, confirmed_count, waitlist_count }) => (
          <Fragment key={w.id}>
            <div className="host-row" data-testid="host-row">
              <CategoryArt category={w.category} height={72} />
              <div className="host-row-main">
                <h4>{w.title} <span className={`status-badge ${w.badge.toLowerCase()}`}>{w.badge}</span></h4>
                <p className="meta"><CalendarDays size={14} /> {formatDate(w.date_time)}, {formatTime(w.date_time)} · {w.area ? `${w.area}, ` : ''}{w.city}</p>
                <p className="meta"><Users size={14} /> {confirmed_count}/{w.capacity} registered{waitlist_count > 0 && ` · ${waitlist_count} on waitlist`}</p>
              </div>
              <div className="host-row-actions">
                <button className="btn btn-soft btn-sm" onClick={() => toggleAttendees(w.id)}>{open === w.id ? 'Hide' : 'View'} Registrations</button>
                {w.status === 'active' && w.badge !== 'Completed' && <Link className="btn btn-outline btn-sm" to={`/host/workshops/${w.id}/edit`}><Pencil size={13} /> Edit</Link>}
                <button className="btn btn-outline btn-sm" onClick={() => duplicate(w)}><Copy size={13} /> Duplicate</button>
                {w.status === 'active' && w.badge !== 'Completed' && <button className="btn btn-outline btn-sm danger" onClick={() => cancelWorkshop(w)}><XCircle size={13} /> Cancel</button>}
              </div>
            </div>
            {open === w.id && (
              <div className="attendees">
                {!attendees ? <p>Loading...</p> : (
                  <div className="two-col">
                    <div>
                      <h5>Confirmed ({attendees.confirmed.length})</h5>
                      {attendees.confirmed.length === 0 && <p className="muted small">No confirmed learners yet.</p>}
                      <ul>{attendees.confirmed.map((a) => <li key={a.learner_id}>{a.name} · <span className="muted">{a.email}</span> · {a.booking_ref}</li>)}</ul>
                    </div>
                    <div>
                      <h5>Waitlist ({attendees.waitlist.length})</h5>
                      {attendees.waitlist.length === 0 && <p className="muted small">Nobody is waiting.</p>}
                      <ol>{attendees.waitlist.map((a) => <li key={a.learner_id}>{a.name}</li>)}</ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
