import { createContext, useContext, useEffect, useState } from 'react'
import api from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kalakriti_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (!localStorage.getItem('kalakriti_token')) return
    api.get('/auth/me').then((res) => saveUser(res.data)).catch(() => logout())
  }, [])

  function saveUser(u) {
    localStorage.setItem('kalakriti_user', JSON.stringify(u))
    setUser(u)
  }

  function handleToken(data) {
    localStorage.setItem('kalakriti_token', data.access_token)
    saveUser(data.user)
    return data.user
  }

  async function login(email, password) {
    const form = new URLSearchParams({ username: email, password })
    const res = await api.post('/auth/login', form)
    return handleToken(res.data)
  }

  async function signup(payload) {
    const res = await api.post('/auth/signup', payload)
    return handleToken(res.data)
  }

  function logout() {
    localStorage.removeItem('kalakriti_token')
    localStorage.removeItem('kalakriti_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
