import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import WorkshopDetail from './pages/WorkshopDetail.jsx'
import Login from './pages/Login.jsx'
import BookingConfirmation from './pages/BookingConfirmation.jsx'
import MyBookings from './pages/MyBookings.jsx'
import HostDashboard from './pages/HostDashboard.jsx'
import WorkshopForm from './pages/WorkshopForm.jsx'
import { useAuth } from './lib/auth.jsx'

function RequireRole({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workshops" element={<main className="container"><Search /></main>} />
        <Route path="/workshops/:id" element={<main className="container"><WorkshopDetail /></main>} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/bookings/confirmed"
          element={<RequireRole role="learner"><main className="container"><BookingConfirmation /></main></RequireRole>}
        />
        <Route
          path="/bookings"
          element={<RequireRole role="learner"><main className="container"><MyBookings /></main></RequireRole>}
        />
        <Route
          path="/host"
          element={<RequireRole role="host"><main className="container"><HostDashboard /></main></RequireRole>}
        />
        <Route
          path="/host/new"
          element={<RequireRole role="host"><main className="container"><WorkshopForm /></main></RequireRole>}
        />
        <Route
          path="/host/workshops/:id/edit"
          element={<RequireRole role="host"><main className="container"><WorkshopForm /></main></RequireRole>}
        />
        <Route path="*" element={<main className="container"><h2>Page not found</h2></main>} />
      </Routes>
    </div>
  )
}
