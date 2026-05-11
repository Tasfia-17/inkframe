import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../utils/api'

interface User { id: number; email: string; credits: number; is_admin: boolean }
interface AuthCtx { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> }

const Ctx = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    }
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  return <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
