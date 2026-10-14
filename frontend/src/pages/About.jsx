import { Link } from 'react-router-dom'
import { ArrowRight, Github, Layers, Lightbulb, PencilRuler, Rocket } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { REPO_URL } from '../components/Footer.jsx'

const TEAM = [
  { name: 'Arya', reg: '24BRS1401' },
  { name: 'Devansh Kalwani', reg: '24BRS1151' },
]

const TIMELINE = [
  { icon: Lightbulb, tag: 'Review 1', title: 'Vision and requirements', text: 'Problem statement, personas, 25 user stories, MoSCoW priorities and Figma wireframes.' },
  { icon: PencilRuler, tag: 'Review 2', title: 'Design', text: 'Layered architecture, design principles, refined UI and key design decisions.' },
  { icon: Rocket, tag: 'Review 3', title: 'Build and test', text: 'Working platform with integration, regression, mutation and end-to-end tests, CI and Docker.' },
]

const STACK = ['React 18', 'Vite', 'Three.js', 'FastAPI', 'SQLAlchemy', 'PostgreSQL 16', 'JWT auth', 'Docker Compose', 'GitHub Actions', 'pytest', 'mutmut', 'Vitest', 'Playwright']

export default function About() {
  return (
    <main className="container about">
      <Reveal as="section" className="about-hero">
        <span className="eyebrow">About Kalakriti</span>
        <h1>Making local craft <span className="gradient-text">easy to find.</span></h1>
        <p>
          Kalakriti (kala, art; kriti, creation) connects people who want to learn a hands-on skill with the artisans and
          instructors teaching it nearby. Learners stop hunting through Instagram stories and WhatsApp groups; hosts stop
          managing bookings over direct messages.
        </p>
      </Reveal>

      <Reveal as="section" className="block">
        <div className="section-title"><span className="eyebrow">Journey</span><h2>How we built it</h2></div>
        <div className="timeline">
          {TIMELINE.map(({ icon: Icon, tag, title, text }) => (
            <div className="timeline-item glass" key={tag}>
              <span className="feature-icon"><Icon size={20} /></span>
              <div>
                <span className="tag">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="block">
        <div className="section-title"><span className="eyebrow">Team</span><h2>The makers</h2></div>
        <div className="team">
          {TEAM.map((m) => (
            <div className="team-card glass" key={m.reg}>
              <span className="avatar lg">{m.name[0]}</span>
              <h3>{m.name}</h3>
              <p className="muted small">{m.reg} · B.Tech CSE, VIT Chennai</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="block">
        <div className="section-title"><span className="eyebrow"><Layers size={14} /> Stack</span><h2>Under the hood</h2></div>
        <div className="stack">{STACK.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </Reveal>

      <Reveal as="section" className="block final-cta">
        <h2>Open source, built in the open.</h2>
        <div className="confirm-actions">
          <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> View on GitHub</a>
          <Link className="btn btn-ghost" to="/workshops">Browse workshops <ArrowRight size={16} /></Link>
        </div>
      </Reveal>
    </main>
  )
}
