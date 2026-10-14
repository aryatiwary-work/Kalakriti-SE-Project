import axios from 'axios'

// By default the website asks its own address for data (/api/...), and the
// Vite server passes those requests on to the backend. That way the site also
// works when it is opened from another device or through a shared link.
export const API_URL = import.meta.env.VITE_API_URL || '/api'

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
