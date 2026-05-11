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
    setError(''); setLoading(true)
    try {
      await api.post('/api/auth/login', { email, password })
      await refresh()
      navigate('/home')
    } catch (err) { setError(getApiError(err)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-vellum flex flex-col">
      <nav className="px-6 py-4 border-b border-border">
        <Link to="/" className="font-serif text-xl text-charcoal">Inkframe</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-charcoal mb-1">Welcome back</h1>
          <p className="text-mutedgray text-sm mb-8">Sign in to continue making films</p>

          <form onSubmit={submit} className="space-y-4">
            <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-mutedgray text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-charcoal underline underline-offset-2 hover:text-inkwell">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
