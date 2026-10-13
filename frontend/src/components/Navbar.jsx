import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CircleUserRound, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <Link to="/" className="brand">Kalakriti</Link>
      <nav>
        <NavLink to="/workshops">Browse Workshops</NavLink>
        {user?.role === 'learner' && <NavLink to="/bookings">My Bookings</NavLink>}
        {user?.role === 'host' && <NavLink to="/host">Host Dashboard</NavLink>}
        {user?.role !== 'learner' && (
          <Link to={user?.role === 'host' ? '/host/new' : '/login?mode=signup&role=host'} className="nav-outline">
            Host a Workshop
          </Link>
        )}
        {user ? (
          <button
            className="nav-user"
            onClick={() => {
              logout()
              navigate('/')
            }}
            title="Log out"
          >
            <CircleUserRound size={18} /> {user.name.split(' ')[0]} <LogOut size={15} />
          </button>
        ) : (
          <Link to="/login" className="nav-user">
            <CircleUserRound size={18} /> Login
          </Link>
        )}
      </nav>
    </header>
  )
}
