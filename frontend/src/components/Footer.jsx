import { Link } from 'react-router-dom'
import { Github, Mail, MapPin } from 'lucide-react'
import { API_URL } from '../lib/api.js'
import Logo from './Logo.jsx'

export const REPO_URL = 'https://github.com/aryatiwary-work/Kalakriti-SE-Project'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand"><Logo /> <span>Kalakriti</span></Link>
          <p>Discover local workshops and skill sessions near you. Learn a craft from the people who live it.</p>
          <p className="meta"><MapPin size={14} /> Chennai, India</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/workshops">All workshops</Link>
          <Link to="/workshops?category=Pottery">Pottery</Link>
          <Link to="/workshops?category=Dance">Dance</Link>
          <Link to="/workshops?category=Painting">Painting</Link>
        </div>
        <div>
          <h4>For hosts</h4>
          <Link to="/login?mode=signup&role=host">Host a workshop</Link>
          <Link to="/host">Host dashboard</Link>
          <a href="/#faq">FAQ</a>
        </div>
        <div>
          <h4>Project</h4>
          <Link to="/about">About &amp; team</Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>
          <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">API docs</a>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer"><Mail size={14} /> Feedback</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Kalakriti · Built by Arya &amp; Devansh Kalwani, VIT Chennai</span>
        <span>Software Engineering project · Review 3</span>
      </div>
    </footer>
  )
}
