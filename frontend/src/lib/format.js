export const CATEGORIES = [
  'Pottery', 'Painting', 'Music', 'Dance', 'Cooking', 'Yoga', 'Calligraphy', 'Woodworking',
]

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = minutes / 60
  return `${Number.isInteger(h) ? h : h.toFixed(1)} hr${h === 1 ? '' : 's'}`
}

export function formatPrice(price) {
  return price === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`
}

export function seatLabel(workshop) {
  if (workshop.status === 'cancelled') return 'Cancelled'
  if (workshop.seats_left === 0) return 'Waitlist open'
  if (workshop.seats_left === 1) return '1 seat left'
  return `${workshop.seats_left} seats left`
}
