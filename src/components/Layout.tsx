import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/players', label: 'Players', icon: '🎽', end: false },
  { to: '/matches', label: 'Matches', icon: '🎾', end: false },
  { to: '/rankings', label: 'Rankings', icon: '🏆', end: false },
]

export default function Layout({
  title,
  subtitle,
  children,
  back,
  headerAction,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  back?: boolean
  headerAction?: { icon: ReactNode; label: string; onClick: () => void }
}) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {back && (
            <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
              ←
            </button>
          )}
          <div>
            <h1>
              <span className="header-ball" />
              {title}
            </h1>
            {subtitle && <div className="subtitle">{subtitle}</div>}
          </div>
        </div>
        {headerAction ? (
          <button className="icon-btn" onClick={headerAction.onClick} aria-label={headerAction.label} title={headerAction.label}>
            {headerAction.icon}
          </button>
        ) : (
          !back && (
            <button className="icon-btn" onClick={() => signOut()} aria-label="Sign out" title="Sign out">
              ⎋
            </button>
          )
        )}
      </header>
      <div className="main-content">{children}</div>
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
