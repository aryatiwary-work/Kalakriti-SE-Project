import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, CalendarCheck2, ChevronDown, Compass, Gauge, LayoutDashboard, ListOrdered, MapPin, Quote,
  Search as SearchIcon, ShieldCheck, Sparkles, Star, Ticket,
} from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { CATEGORIES } from '../lib/format.js'
import { tiltHandlers, useCountUp } from '../lib/motion.js'
import { categoryStyle } from '../components/CategoryArt.jsx'
import WorkshopCard from '../components/WorkshopCard.jsx'
import Reveal from '../components/Reveal.jsx'
import SkeletonGrid from '../components/Skeleton.jsx'

const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

const STEPS = [
  { icon: Compass, title: 'Discover', text: 'Search by city, craft, date and price. Every card shows the seats left in real time.' },
  { icon: Ticket, title: 'Book or join the waitlist', text: 'Book in one click and get a KAL- reference. Full? Join the waitlist and keep your place in line.' },
  { icon: Star, title: 'Learn and review', text: 'Show up, make something, then rate the session. Only real attendees can review.' },
]

const FEATURES = [
  { icon: Gauge, title: 'Live seat counter', text: 'Seats are locked row-by-row in the database, so a session can never be overbooked.' },
  { icon: ListOrdered, title: 'Fair waitlist', text: 'When someone cancels, the next learner in line gets the seat automatically.' },
  { icon: BadgeCheck, title: 'Verified hosts', text: 'Our team checks hosts before they get the verified badge.' },
  { icon: LayoutDashboard, title: 'Host dashboard', text: 'Registrations, waitlists, ratings and one-click duplicate for repeat sessions.' },
  { icon: ShieldCheck, title: 'Secure accounts', text: 'Salted password hashing and signed tokens, with role-based access everywhere.' },
  { icon: CalendarCheck2, title: 'My Bookings', text: 'Every booking and waitlist place in one list, upcoming first.' },
]

const FAQ = [
  ['How do I pay for a workshop?', 'Payment is made to the host at the venue, in cash or UPI. Kalakriti handles discovery and booking.'],
  ['What happens if a workshop is full?', 'Join the waitlist. If a confirmed learner cancels, the seat goes straight to the first person in line and it shows up in their bookings.'],
  ['Can I cancel a booking?', 'Yes, any time before the session starts, from My Bookings. Your seat is passed to the waitlist.'],
  ['Who can write a review?', 'Only learners who held a confirmed seat, once per workshop, after the session has taken place.'],
  ['How do I become a host?', 'Sign up as a host and list your first workshop in a couple of minutes. Our team verifies hosts for the badge.'],
]

function Stat({ value, label }) {
  const n = useCountUp(value)
  return (
    <div className="stat">
      <strong>{value == null ? '—' : n.toLocaleString('en-IN')}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [city, setCity] = useState('Chennai')
  const [q, setQ] = useState('')
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api
      .get('/workshops/', { params: { city } })
      .then((res) => setWorkshops(res.data.slice(0, 8)))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
    api.get('/stats').then((res) => setStats(res.data)).catch(() => {})
    api.get('/reviews/recent', { params: { limit: 6 } }).then((res) => setReviews(res.data)).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goSearch(extra = {}) {
    const params = new URLSearchParams({ ...(city && { city }), ...(q && { q }), ...extra })
    navigate(`/workshops?${params}`)
  }

  return (
    <>
      <section className="hero">
        <Suspense fallback={<div className="hero3d hero3d-fallback" />}>
          <Hero3D />
        </Suspense>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-inner">
          <span className="eyebrow"><Sparkles size={14} /> Hands-on workshops near you</span>
          <h1>
            Learn a craft.<br />
            <span className="gradient-text">Meet your maker.</span>
          </h1>
          <p>Pottery, dance, painting, cooking and more. Find a session in your city, see the seats left live, and book in one click.</p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault()
              goSearch()
            }}
          >
            <label>
              <span>Location</span>
              <div className="input-icon"><MapPin size={16} /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City or area" /></div>
            </label>
            <label>
              <span>What do you want to learn?</span>
              <div className="input-icon"><SearchIcon size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="pottery, salsa, baking..." /></div>
            </label>
            <button className="btn btn-primary" type="submit">Search <ArrowRight size={16} /></button>
          </form>
          <div className="stats">
            <Stat value={stats?.upcoming_workshops} label="Upcoming workshops" />
            <Stat value={stats?.hosts} label="Local hosts" />
            <Stat value={stats?.cities} label="Cities" />
            <Stat value={stats?.seats_booked} label="Seats booked" />
          </div>
        </div>
        <a href="#categories" className="scroll-cue" aria-label="Scroll to categories"><ChevronDown size={20} /></a>
      </section>

      <main className="container home">
        <Reveal as="section" id="categories" className="block">
          <div className="section-title">
            <span className="eyebrow">Explore</span>
            <h2>Pick a craft</h2>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((c, i) => {
              const { icon: Icon, from, to } = categoryStyle(c)
              return (
                <button
                  key={c}
                  className="category-tile tilt"
                  style={{ '--from': from, '--to': to, transitionDelay: `${i * 40}ms` }}
                  onClick={() => goSearch({ category: c })}
                  {...tiltHandlers(12)}
                >
                  <span className="category-tile-icon"><Icon size={26} strokeWidth={1.6} /></span>
                  <strong>{c}</strong>
                  <ArrowRight size={16} className="go" />
                </button>
              )
            })}
          </div>
        </Reveal>

        <Reveal as="section" className="block">
          <div className="section-head">
            <div className="section-title">
              <span className="eyebrow">This week</span>
              <h2>Happening soon near you</h2>
            </div>
            <Link to={`/workshops?city=${encodeURIComponent(city)}`}>View all workshops <ArrowRight size={14} /></Link>
          </div>
          {loading && <SkeletonGrid count={4} />}
          {error && <p className="error">{error}</p>}
          {!loading && !error && workshops.length === 0 && <p className="muted">No upcoming workshops in {city} yet.</p>}
          <div className="grid">
            {workshops.map((w) => <WorkshopCard key={w.id} workshop={w} />)}
          </div>
        </Reveal>

        <Reveal as="section" className="block">
          <div className="section-title center">
            <span className="eyebrow">How it works</span>
            <h2>From browsing to the workbench in three steps</h2>
          </div>
          <div className="steps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div className="step glass tilt" key={title} {...tiltHandlers(8)}>
                <span className="step-no">0{i + 1}</span>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="block">
          <div className="section-title center">
            <span className="eyebrow">Why Kalakriti</span>
            <h2>Built for learners and hosts</h2>
          </div>
          <div className="features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div className="feature" key={title}>
                <span className="feature-icon"><Icon size={20} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {reviews.length > 0 && (
          <Reveal as="section" className="block">
            <div className="section-title center">
              <span className="eyebrow">Reviews</span>
              <h2>What learners say</h2>
            </div>
            <div className="testimonials">
              {reviews.map((r) => (
                <figure className="testimonial glass" key={r.id}>
                  <Quote size={22} className="quote" />
                  <blockquote>{r.comment}</blockquote>
                  <figcaption>
                    <span className="avatar">{r.learner_name[0]}</span>
                    <span>
                      <strong>{r.learner_name}</strong>
                      <Link to={`/workshops/${r.workshop_id}`}>{r.workshop_title}</Link>
                    </span>
                    <span className="rating"><Star size={13} className="star on" /> {r.rating}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal as="section" className="block host-cta glass">
          <div>
            <span className="eyebrow">For hosts</span>
            <h2>Teach what you love</h2>
            <p>List a workshop in minutes, and let Kalakriti handle capacity, the waitlist and attendee lists. You focus on teaching.</p>
            <ul>
              <li><BadgeCheck size={16} /> Verified host badge</li>
              <li><LayoutDashboard size={16} /> Live dashboard of every session</li>
              <li><ListOrdered size={16} /> Automatic waitlist when you sell out</li>
            </ul>
            <Link className="btn btn-primary" to="/login?mode=signup&role=host">Become a host <ArrowRight size={16} /></Link>
          </div>
          <div className="host-cta-art" aria-hidden="true">
            {['Pottery', 'Dance', 'Painting'].map((c, i) => {
              const { icon: Icon, from, to } = categoryStyle(c)
              return (
                <span key={c} className={`float-card f${i}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                  <Icon size={34} strokeWidth={1.4} />
                </span>
              )
            })}
          </div>
        </Reveal>

        <Reveal as="section" className="block" id="faq">
          <div className="section-title center">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {FAQ.map(([qn, a]) => (
              <details key={qn}>
                <summary>{qn}<ChevronDown size={18} /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="block final-cta">
          <h2>Your next weekend project is a click away.</h2>
          <div className="confirm-actions">
            <Link className="btn btn-primary" to="/workshops">Browse workshops <ArrowRight size={16} /></Link>
            <Link className="btn btn-ghost" to="/login?mode=signup">Create a free account</Link>
          </div>
        </Reveal>
      </main>
    </>
  )
}
