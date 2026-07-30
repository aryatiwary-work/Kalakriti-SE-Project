import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
        <h1>Kalakriti</h1>
      </Link>
    </div>
  )
}
