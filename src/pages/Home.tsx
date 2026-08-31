import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerAvatar from '../components/PlayerAvatar'
import StatusPill from '../components/StatusPill'
import { fetchAllParticipants, fetchMatches, fetchPlayers } from '../lib/api'
import type { Match, MatchParticipant, Player } from '../types'

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [participants, setParticipants] = useState<MatchParticipant[]>([])

  useEffect(() => {
    Promise.all([fetchPlayers(), fetchMatches(), fetchAllParticipants()]).then(([p, m, pt]) => {
      setPlayers(p)
      setMatches(m)
      setParticipants(pt)
    })
  }, [])

  const playersById = new Map(players.map((p) => [p.id, p]))
  const live = matches?.filter((m) => m.status === 'in_progress') ?? []
  const upcoming = matches?.filter((m) => m.status === 'scheduled') ?? []
  const completed = matches?.filter((m) => m.status === 'completed') ?? []

  function names(matchId: string, side: 'A' | 'B') {
    return participants
      .filter((p) => p.match_id === matchId && p.side === side)
      .map((p) => playersById.get(p.player_id))
      .filter((p): p is Player => Boolean(p))
  }

  return (
    <Layout title="TKBM Open" subtitle="Local tennis tournament">
      <div className="stat-grid">
        <div className="stat-box">
          <div className="num">{players.length}</div>
          <div className="label">Players</div>
        </div>
        <div className="stat-box">
          <div className="num">{matches ? matches.length : '–'}</div>
          <div className="label">Matches</div>
        </div>
        <div className="stat-box">
          <div className="num">{completed.length}</div>
          <div className="label">Completed</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Link to="/matches/new" className="btn btn-primary" style={{ flex: 1 }}>
          + New match
        </Link>
        <Link to="/players" className="btn btn-outline" style={{ flex: 1 }}>
          + Add player
        </Link>
      </div>

      {matches === null && <Loading />}

      {live.length > 0 && (
        <>
          <div className="section-title">Live now</div>
          {live.map((m) => (
            <Link key={m.id} to={`/matches/${m.id}`} style={{ display: 'block' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                    {m.match_type}
                  </span>
                  <StatusPill status={m.status} />
                </div>
                <MiniMatchup a={names(m.id, 'A')} b={names(m.id, 'B')} scoreA={m.score_a} scoreB={m.score_b} />
              </div>
            </Link>
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="section-title">
            Upcoming
            <Link to="/matches" className="link-muted">
              See all
            </Link>
          </div>
          {upcoming.slice(0, 3).map((m) => (
            <Link key={m.id} to={`/matches/${m.id}`} style={{ display: 'block' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                    {m.match_type} · to {m.game_point}
                  </span>
                  <StatusPill status={m.status} />
                </div>
                <MiniMatchup a={names(m.id, 'A')} b={names(m.id, 'B')} scoreA={null} scoreB={null} />
              </div>
            </Link>
          ))}
        </>
      )}

      {matches !== null && matches.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🎾</div>
          <p>Add players and create your first match to get started.</p>
        </div>
      )}

      {completed.length > 0 && (
        <>
          <div className="section-title">
            Recent results
            <Link to="/matches" className="link-muted">
              See all
            </Link>
          </div>
          {completed.slice(0, 3).map((m) => (
            <Link key={m.id} to={`/matches/${m.id}`} style={{ display: 'block' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                    {m.match_type}
                  </span>
                  <StatusPill status={m.status} />
                </div>
                <MiniMatchup a={names(m.id, 'A')} b={names(m.id, 'B')} scoreA={m.score_a} scoreB={m.score_b} winner={m.winner_side} />
              </div>
            </Link>
          ))}
        </>
      )}
    </Layout>
  )
}

function MiniMatchup({
  a,
  b,
  scoreA,
  scoreB,
  winner,
}: {
  a: Player[]
  b: Player[]
  scoreA: number | null
  scoreB: number | null
  winner?: 'A' | 'B' | null
}) {
  return (
    <div>
      <MiniSide players={a} score={scoreA} won={winner === 'A'} />
      <MiniSide players={b} score={scoreB} won={winner === 'B'} />
    </div>
  )
}

function MiniSide({ players, score, won }: { players: Player[]; score: number | null; won: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex' }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
              <PlayerAvatar player={p} size={26} />
            </div>
          ))}
        </div>
        <span style={{ fontWeight: won ? 800 : 600, fontSize: '0.85rem' }}>{players.map((p) => p.name).join(' & ') || '—'}</span>
      </div>
      {score !== null && <span style={{ fontWeight: 800, color: won ? 'var(--court)' : 'var(--ink)' }}>{score}</span>}
    </div>
  )
}
