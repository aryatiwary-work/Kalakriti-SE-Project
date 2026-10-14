export default function SeatMeter({ capacity, seatsFilled }) {
  const pct = capacity ? Math.min(100, Math.round((seatsFilled / capacity) * 100)) : 0
  const left = Math.max(capacity - seatsFilled, 0)
  return (
    <div className="seat-meter" aria-label="seat availability">
      <div className="seat-meter-text">
        <strong>{left === 0 ? 'Fully booked' : `${left} seat${left === 1 ? '' : 's'} remaining`}</strong>
        <span>{seatsFilled}/{capacity} seats filled</span>
      </div>
      <div className="seat-meter-bar">
        <div className={`seat-meter-fill ${left === 0 ? 'full' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
