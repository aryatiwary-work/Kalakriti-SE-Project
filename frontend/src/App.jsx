import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import WorkshopDetail from './pages/WorkshopDetail.jsx'
import Login from './pages/Login.jsx'
import BookingConfirmation from './pages/BookingConfirmation.jsx'
import MyBookings from './pages/MyBookings.jsx'
import HostDashboard from './pages/HostDashboard.jsx'
import WorkshopForm from './pages/WorkshopForm.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import { useAuth } from './lib/auth.jsx'

function RequireRole({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}

function ScrollChrome() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <button
        className={`to-top ${progress > 0.15 ? 'show' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={18} />
      </button>
    </>
  )
}

const page = (el) => <main className="container page">{el}</main>

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <ScrollChrome />
      <Navbar />
      <div className="route" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/workshops" element={page(<Search />)} />
          <Route path="/workshops/:id" element={page(<WorkshopDetail />)} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookings/confirmed" element={<RequireRole role="learner">{page(<BookingConfirmation />)}</RequireRole>} />
          <Route path="/bookings" element={<RequireRole role="learner">{page(<MyBookings />)}</RequireRole>} />
          <Route path="/host" element={<RequireRole role="host">{page(<HostDashboard />)}</RequireRole>} />
          <Route path="/host/new" element={<RequireRole role="host">{page(<WorkshopForm />)}</RequireRole>} />
          <Route path="/host/workshops/:id/edit" element={<RequireRole role="host">{page(<WorkshopForm />)}</RequireRole>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
