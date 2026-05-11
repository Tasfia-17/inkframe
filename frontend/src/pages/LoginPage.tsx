import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refresh } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/login', { email, password })
      await refresh()
      navigate('/')
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Inkframe</h1>
        <p className="text-gray-400 text-center mb-8">Story → Video</p>
        <form onSubmit={submit} className="bg-gray-900 rounded-xl p-6 space-y-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="text-center text-gray-500 mt-4 text-sm">
          No account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
