import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../lib/api.js'
import { CATEGORIES } from '../lib/format.js'

const EMPTY = {
  title: '', description: '', category: 'Pottery', city: 'Chennai', area: '', date_time: '',
  duration_minutes: 120, skill_level: 'Beginner', price: 0, capacity: 10,
}

export default function WorkshopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/workshops/${id}`).then((res) => {
      const w = res.data
      setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, k === 'date_time' ? w.date_time.slice(0, 16) : (w[k] ?? '')])))
    })
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError(null)
    const payload = {
      ...form,
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      capacity: Number(form.capacity),
      area: form.area || null,
    }
    try {
      const res = id ? await api.patch(`/workshops/${id}`, payload) : await api.post('/workshops/', payload)
      navigate(id ? '/host' : `/workshops/${res.data.id}`)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>{id ? 'Edit workshop' : 'List a new workshop'}</h2>
      <label>Title<input value={form.title} onChange={set('title')} required minLength={3} placeholder="Pottery Basics Workshop" /></label>
      <label>Description<textarea value={form.description} onChange={set('description')} placeholder="What will learners make or learn?" /></label>
      <div className="two-col">
        <label>Category<select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Skill level
          <select value={form.skill_level} onChange={set('skill_level')}>
            {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="two-col">
        <label>City<input value={form.city} onChange={set('city')} required /></label>
        <label>Area / venue<input value={form.area} onChange={set('area')} placeholder="Alwarpet" /></label>
      </div>
      <div className="two-col">
        <label>Date &amp; time<input type="datetime-local" value={form.date_time} onChange={set('date_time')} required /></label>
        <label>Duration (minutes)<input type="number" min="15" value={form.duration_minutes} onChange={set('duration_minutes')} required /></label>
      </div>
      <div className="two-col">
        <label>Price per person (₹)<input type="number" min="0" value={form.price} onChange={set('price')} required /></label>
        <label>Capacity (seats)<input type="number" min="1" max="500" value={form.capacity} onChange={set('capacity')} required /></label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary">{id ? 'Save changes' : 'Publish workshop'}</button>
    </form>
  )
}
