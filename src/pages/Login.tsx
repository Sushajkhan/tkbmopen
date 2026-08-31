import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import TrophyIcon from '../components/TrophyIcon'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, var(--rg-green) 0%, var(--rg-green-dark) 45%, var(--court-dark) 100%)',
        padding: 20,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 380, boxShadow: '0 16px 40px rgba(13, 36, 26, 0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--court) 0%, var(--court-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 4px var(--rg-green-light)',
            }}
          >
            <TrophyIcon size={28} />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 12 }}>TKBM Open</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 4 }}>
            Sign in to manage your tennis tournament
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="error-text" style={{ marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
