import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data
    if (typeof d?.detail === 'string') return d.detail
    if (Array.isArray(d?.detail)) return d.detail.map((e: any) => e.msg).join(', ')
  }
  return 'Something went wrong'
}
