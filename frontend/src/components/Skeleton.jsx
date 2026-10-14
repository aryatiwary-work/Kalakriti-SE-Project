export function CardSkeleton() {
  return (
    <div className="workshop-card skeleton-card" aria-hidden="true">
      <div className="skeleton" style={{ height: 130 }} />
      <div className="workshop-card-body">
        <div className="skeleton line" style={{ width: '80%' }} />
        <div className="skeleton line" style={{ width: '45%' }} />
        <div className="skeleton line" style={{ width: '65%' }} />
        <div className="skeleton line" style={{ width: '100%', height: 34, marginTop: 8 }} />
      </div>
    </div>
  )
}

export default function SkeletonGrid({ count = 4, className = 'grid' }) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading workshops">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}
