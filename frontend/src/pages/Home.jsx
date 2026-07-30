import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Home() {
  const [workshops, setWorkshops] = useState([])
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWorkshops = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (city) params.city = city
      if (category) params.category = category
      const res = await axios.get(`${API_URL}/workshops/`, { params })
      setWorkshops(res.data)
    } catch (err) {
      setError('Could not reach the Kalakriti API. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkshops()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h2>Discover workshops near you</h2>
      <div className="filters">
        <input
          placeholder="City (e.g. Chennai)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="Category (e.g. pottery)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={fetchWorkshops}>Search</button>
      </div>

      {loading && <p>Loading workshops...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && workshops.length === 0 && (
        <p>No workshops found yet. Add some via the API at /docs.</p>
      )}

      {workshops.map((w) => (
        <div className="card" key={w.id}>
          <h3>
            <Link to={`/workshops/${w.id}`}>{w.title}</Link>
          </h3>
          <span className="tag">{w.category}</span>
          <span className="tag">{w.city}</span>
          <span className="tag">
            {w.seats_filled}/{w.capacity} seats filled
          </span>
          <p>{w.description}</p>
        </div>
      ))}
    </div>
  )
}
