import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
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
      await api.post('/api/auth/register', { email, password })
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
        <p className="text-gray-400 text-center mb-8">Create your account</p>
        <form onSubmit={submit} className="bg-gray-900 rounded-xl p-6 space-y-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="text-center text-gray-500 mt-4 text-sm">
          Have an account? <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
