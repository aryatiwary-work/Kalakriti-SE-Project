import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import api, { errorMessage } from '../lib/api.js'
import { CATEGORIES } from '../lib/format.js'
import WorkshopCard from '../components/WorkshopCard.jsx'

const FILTER_KEYS = ['city', 'q', 'category', 'date_from', 'date_to', 'min_price', 'max_price']
const LABELS = {
  city: 'City', q: 'Search', category: 'Category', date_from: 'From', date_to: 'To', min_price: 'Min ₹', max_price: 'Max ₹',
}

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() => Object.fromEntries(params.entries()))
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setDraft(Object.fromEntries(params.entries()))
    setLoading(true)
    setError(null)
    api
      .get('/workshops/', { params: Object.fromEntries(params.entries()) })
      .then((res) => setResults(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [params])

  function apply(next) {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v != null))
    setParams(clean)
  }

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value })
  const active = FILTER_KEYS.filter((k) => params.get(k))

  return (
    <div className="search-layout">
      <aside className="filter-panel">
        <h3>Filters</h3>
        <label>City or area<input value={draft.city || ''} onChange={set('city')} placeholder="e.g. Chennai" /></label>
        <label>Keyword<input value={draft.q || ''} onChange={set('q')} placeholder="e.g. wheel" /></label>
        <label>
          Category
          <select value={draft.category || ''} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="two-col">
          <label>From<input type="date" value={(draft.date_from || '').slice(0, 10)} onChange={set('date_from')} /></label>
          <label>To<input type="date" value={(draft.date_to || '').slice(0, 10)} onChange={set('date_to')} /></label>
        </div>
        <div className="two-col">
          <label>Min price (₹)<input type="number" min="0" value={draft.min_price || ''} onChange={set('min_price')} /></label>
          <label>Max price (₹)<input type="number" min="0" value={draft.max_price || ''} onChange={set('max_price')} /></label>
        </div>
        <label>
          Sort by
          <select value={draft.sort || 'date'} onChange={set('sort')}>
            <option value="date">Soonest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Rating</option>
            <option value="seats">Most seats left</option>
          </select>
        </label>
        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            const d = { ...draft }
            if (d.date_to && d.date_to.length === 10) d.date_to = `${d.date_to}T23:59`
            apply(d)
          }}
        >
          <SearchIcon size={16} /> Apply Filters
        </button>
      </aside>

      <section>
        <div className="section-head">
          <h2>{loading ? 'Searching…' : `${results.length} workshop${results.length === 1 ? '' : 's'} found`}</h2>
          {active.length > 0 && <button className="link-btn" onClick={() => apply({ sort: params.get('sort') })}>Clear all</button>}
        </div>
        {active.length > 0 && (
          <div className="chips" data-testid="active-filters">
            {active.map((k) => (
              <span key={k} className="chip">
                {LABELS[k]}: {params.get(k).replace('T23:59', '')}
                <button aria-label={`remove ${k}`} onClick={() => apply({ ...Object.fromEntries(params.entries()), [k]: '' })}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className="muted">No workshops match these filters. Try widening the date or price range.</p>
        )}
        <div className="grid grid-3">
          {results.map((w) => <WorkshopCard key={w.id} workshop={w} />)}
        </div>
      </section>
    </div>
  )
}
