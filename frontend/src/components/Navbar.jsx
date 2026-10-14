import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CircleUserRound, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''}`}>
      <Link to="/" className="brand"><Logo /> <span>Kalakriti</span></Link>
      <button className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav>
        <NavLink to="/workshops">Browse Workshops</NavLink>
        <NavLink to="/about">About</NavLink>
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
          <Link to="/login" className="nav-user nav-cta">
            <CircleUserRound size={18} /> Login
          </Link>
        )}
      </nav>
    </header>
  )
}
