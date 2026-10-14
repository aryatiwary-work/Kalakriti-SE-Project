import { Link } from 'react-router-dom'
import { ArrowLeft, Amphora } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="container not-found">
      <Amphora size={72} strokeWidth={1.2} className="spin-slow" />
      <h1>404</h1>
      <h2>Page not found</h2>
      <p className="muted">This page cracked in the kiln. Let's get you back to the workshops.</p>
      <Link className="btn btn-primary" to="/"><ArrowLeft size={16} /> Back home</Link>
    </main>
  )
}
