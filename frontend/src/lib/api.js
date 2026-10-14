import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kalakriti_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.replace('Value error, ', '')
  if (!err?.response) return 'Could not reach the Kalakriti API. Is the backend running?'
  return fallback
}

export default api
