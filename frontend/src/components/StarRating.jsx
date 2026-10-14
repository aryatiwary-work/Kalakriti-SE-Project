import { Star } from 'lucide-react'

export default function StarRating({ value = 0, size = 15, onChange }) {
  return (
    <span className="stars" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-label={onChange ? `${n} star${n > 1 ? 's' : ''}` : undefined}
          className={n <= Math.round(value) ? 'star on' : 'star'}
          onClick={onChange ? () => onChange(n) : undefined}
          style={onChange ? { cursor: 'pointer' } : undefined}
        />
      ))}
    </span>
  )
}
