import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import WorkshopDetail from './pages/WorkshopDetail.jsx'

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workshops/:id" element={<WorkshopDetail />} />
        </Routes>
      </main>
    </div>
  )
}
