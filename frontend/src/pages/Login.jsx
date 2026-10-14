import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, Lock, Mail, Palette, Sparkles, User } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../lib/auth.jsx'
import { errorMessage } from '../lib/api.js'

// Accounts created by `python -m app.seed` for demonstrations
const DEMO_PASSWORD = 'kalakriti123'
const DEMOS = [
  { email: 'arjun@example.com', label: 'Learner', who: 'Arjun Mehta', icon: GraduationCap },
  { email: 'meera@claystudio.in', label: 'Host', who: 'Clay Studio', icon: Palette },
]

export default function Login() {
  const [params] = useSearchParams()
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [role, setRole] = useState(params.get('role') === 'host' ? 'host' : 'learner')
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e, demo) {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = demo
        ? await login(demo, DEMO_PASSWORD)
        : mode === 'login'
          ? await login(form.email, form.password)
          : await signup({ ...form, role })
      navigate(user.role === 'host' ? '/host' : '/workshops')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-logo"><Logo size={44} /></span>
        <h1 className="auth-brand">KALAKRITI</h1>
        <p className="muted center">Discover Local Workshops &amp; Skill Sessions Near You</p>
        <div className="tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        {mode === 'signup' && (
          <>
            <p className="small"><strong>I want to join as:</strong></p>
            <div className="role-choice">
              <button type="button" className={role === 'learner' ? 'active' : ''} onClick={() => setRole('learner')}>
                <GraduationCap /> <span><strong>Learner</strong><small>Discover &amp; book workshops</small></span>
              </button>
              <button type="button" className={role === 'host' ? 'active' : ''} onClick={() => setRole('host')}>
                <Palette /> <span><strong>Host a Workshop</strong><small>Create &amp; manage sessions</small></span>
              </button>
            </div>
            <div className="input-icon"><User size={16} /><input placeholder="Full name" value={form.name} onChange={set('name')} required /></div>
          </>
        )}
        <div className="input-icon"><Mail size={16} /><input type="email" placeholder="Email" value={form.email} onChange={set('email')} required /></div>
        <div className="input-icon"><Lock size={16} /><input type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={set('password')} required /></div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-dark btn-block" disabled={busy}>
          {mode === 'login' ? 'Log In' : `Create ${role === 'host' ? 'Host' : 'Learner'} Account`}
        </button>
        <p className="small center muted">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
        {mode === 'login' && (
          <div className="demo-box">
            <p className="small"><Sparkles size={14} /> <strong>Try the demo</strong> (seeded data)</p>
            <div className="demo-buttons">
              {DEMOS.map(({ email, label, who, icon: Icon }) => (
                <button type="button" key={email} className="demo-btn" disabled={busy} onClick={() => submit(null, email)}>
                  <Icon size={18} /> <span><strong>Demo {label}</strong><small>{who}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
