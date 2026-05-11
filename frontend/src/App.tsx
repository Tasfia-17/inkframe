import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

const LandingPage   = lazy(() => import('./pages/LandingPage'))
const LoginPage     = lazy(() => import('./pages/LoginPage'))
const RegisterPage  = lazy(() => import('./pages/RegisterPage'))
const HomePage      = lazy(() => import('./pages/HomePage'))
const ProjectPage   = lazy(() => import('./pages/ProjectPage'))

const Loader = () => (
  <div className="min-h-screen bg-vellum flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
  </div>
)

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (user) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"          element={<RedirectIfAuthed><LandingPage /></RedirectIfAuthed>} />
            <Route path="/login"     element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
            <Route path="/register"  element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>} />
            <Route path="/home"      element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/project/:id" element={<RequireAuth><ProjectPage /></RequireAuth>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
