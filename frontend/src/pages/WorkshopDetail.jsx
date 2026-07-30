import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function WorkshopDetail() {
  const { id } = useParams()
  const [workshop, setWorkshop] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios
      .get(`${API_URL}/workshops/${id}`)
      .then((res) => setWorkshop(res.data))
      .catch(() => setError('Workshop not found.'))
  }, [id])

  if (error) return <p style={{ color: 'crimson' }}>{error}</p>
  if (!workshop) return <p>Loading...</p>

  return (
    <div className="card">
      <h2>{workshop.title}</h2>
      <span className="tag">{workshop.category}</span>
      <span className="tag">{workshop.city}</span>
      <p>{workshop.description}</p>
      <p>
        <strong>Date:</strong> {new Date(workshop.date_time).toLocaleString()}
      </p>
      <p>
        <strong>Duration:</strong> {workshop.duration_minutes} minutes
      </p>
      <p>
        <strong>Price:</strong> ₹{workshop.price}
      </p>
      <p>
        <strong>Seats:</strong> {workshop.seats_filled}/{workshop.capacity}
      </p>
    </div>
  )
}
