import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerAvatar from '../components/PlayerAvatar'
import StatusPill from '../components/StatusPill'
import { fetchAllParticipants, fetchMatches, fetchPlayers } from '../lib/api'
import type { Match, MatchParticipant, MatchStatus, Player } from '../types'

const FILTERS: { key: MatchStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'Live' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
]

export default function Matches() {
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [participants, setParticipants] = useState<MatchParticipant[]>([])
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all')

  useEffect(() => {
    Promise.all([fetchMatches(), fetchPlayers(), fetchAllParticipants()]).then(([m, p, pt]) => {
      setMatches(m)
      setPlayers(p)
      setParticipants(pt)
    })
  }, [])

  const playersById = new Map(players.map((p) => [p.id, p]))
  const filtered = matches?.filter((m) => filter === 'all' || m.status === filter) ?? []

  return (
    <Layout title="Matches">
      <div className="tab-row">
        {FILTERS.map((f) => (
          <button key={f.key} className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {matches === null && <Loading />}

      {matches !== null && filtered.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🎾</div>
          <p>No matches here yet.</p>
        </div>
      )}

      {filtered.map((m) => {
        const sideA = participants.filter((p) => p.match_id === m.id && p.side === 'A').map((p) => playersById.get(p.player_id)).filter(Boolean) as Player[]
        const sideB = participants.filter((p) => p.match_id === m.id && p.side === 'B').map((p) => playersById.get(p.player_id)).filter(Boolean) as Player[]
        return (
          <Link key={m.id} to={`/matches/${m.id}`} style={{ display: 'block' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                  {m.match_type} · to {m.game_point}
                </span>
                <StatusPill status={m.status} />
              </div>
              <MatchSideRow players={sideA} score={m.score_a} isWinner={m.winner_side === 'A'} />
              <div style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.72rem', fontWeight: 700, margin: '4px 0' }}>vs</div>
              <MatchSideRow players={sideB} score={m.score_b} isWinner={m.winner_side === 'B'} />
            </div>
          </Link>
        )
      })}

      <Link to="/matches/new" className="btn btn-accent fab">
        + New match
      </Link>
    </Layout>
  )
}

function MatchSideRow({ players, score, isWinner }: { players: Player[]; score: number; isWinner: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex' }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -10 }}>
              <PlayerAvatar player={p} size={30} />
            </div>
          ))}
        </div>
        <span style={{ fontWeight: isWinner ? 800 : 600, fontSize: '0.88rem' }}>
          {players.map((p) => p.name).join(' & ') || '—'}
        </span>
      </div>
      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: isWinner ? 'var(--court)' : 'var(--ink)' }}>{score}</span>
    </div>
  )
}
