import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, HeartHandshake, LayoutGrid, MapPin, Search as SearchIcon, ShieldCheck, Users } from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { CATEGORIES } from '../lib/format.js'
import { categoryStyle } from '../components/CategoryArt.jsx'
import WorkshopCard from '../components/WorkshopCard.jsx'

export default function Home() {
  const navigate = useNavigate()
  const [city, setCity] = useState('Chennai')
  const [q, setQ] = useState('')
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get('/workshops/', { params: { city } })
      .then((res) => setWorkshops(res.data.slice(0, 8)))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goSearch(extra = {}) {
    const params = new URLSearchParams({ ...(city && { city }), ...(q && { q }), ...extra })
    navigate(`/workshops?${params}`)
  }

  return (
    <>
      <section className="hero">
        <h1>Discover Local Workshops &amp;<br />Skill Sessions Near You</h1>
        <p>Explore hands-on workshops in your city. Learn, create, and grow with amazing local artisans and instructors.</p>
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
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
        <div className="category-strip">
          <button className="category-chip active" onClick={() => goSearch()}>
            <LayoutGrid size={20} /> All Categories
          </button>
          {CATEGORIES.map((c) => {
            const Icon = categoryStyle(c).icon
            return (
              <button key={c} className="category-chip" onClick={() => goSearch({ category: c })}>
                <Icon size={20} /> {c}
              </button>
            )
          })}
        </div>
      </section>

      <main className="container">
        <div className="section-head">
          <h2>Happening soon near you</h2>
          <Link to={`/workshops?city=${encodeURIComponent(city)}`}>View all workshops →</Link>
        </div>
        {loading && <p>Loading workshops...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && workshops.length === 0 && <p className="muted">No upcoming workshops in {city} yet.</p>}
        <div className="grid">
          {workshops.map((w) => <WorkshopCard key={w.id} workshop={w} />)}
        </div>

        <div className="trust-strip">
          <div><Users /><span><strong>Trusted Hosts</strong>Verified instructors and artisans</span></div>
          <div><ShieldCheck /><span><strong>Safe &amp; Secure</strong>Your data is safe with us</span></div>
          <div><HeartHandshake /><span><strong>Community</strong>Learn, connect and grow together</span></div>
          <div><CalendarDays /><span><strong>Easy Booking</strong>Simple registration and confirmation</span></div>
        </div>
      </main>
    </>
  )
}
