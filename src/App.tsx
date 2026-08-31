import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Loading from './components/Loading'
import Login from './pages/Login'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Matches from './pages/Matches'
import NewMatch from './pages/NewMatch'
import MatchDetail from './pages/MatchDetail'
import Rankings from './pages/Rankings'

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </div>
    )
  }

  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/players"
        element={
          <RequireAuth>
            <Players />
          </RequireAuth>
        }
      />
      <Route
        path="/players/:id"
        element={
          <RequireAuth>
            <PlayerProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/matches"
        element={
          <RequireAuth>
            <Matches />
          </RequireAuth>
        }
      />
      <Route
        path="/matches/new"
        element={
          <RequireAuth>
            <NewMatch />
          </RequireAuth>
        }
      />
      <Route
        path="/matches/:id"
        element={
          <RequireAuth>
            <MatchDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/rankings"
        element={
          <RequireAuth>
            <Rankings />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
