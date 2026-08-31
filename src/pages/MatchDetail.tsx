import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerAvatar from '../components/PlayerAvatar'
import StatusPill from '../components/StatusPill'
import { completeMatch, deleteMatch, fetchMatchWithParticipants, startMatch, updateScore } from '../lib/api'
import type { MatchWithParticipants, Side } from '../types'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [match, setMatch] = useState<MatchWithParticipants | null>(null)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!id) return
    const m = await fetchMatchWithParticipants(id)
    setMatch(m)
    setScoreA(m.score_a)
    setScoreB(m.score_b)
  }

  useEffect(() => {
    load()
  }, [id])

  if (!match) {
    return (
      <Layout title="Match" back>
        <Loading />
      </Layout>
    )
  }

  const sideA = match.participants.filter((p) => p.side === 'A')
  const sideB = match.participants.filter((p) => p.side === 'B')

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function handleFinish(winner: Side) {
    if (!id) return
    await run(() => completeMatch(id, scoreA, scoreB, winner))
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Delete this match? This cannot be undone.')) return
    await run(async () => {
      await deleteMatch(id)
      navigate('/matches')
    })
  }

  return (
    <Layout title={match.match_type === 'singles' ? 'Singles match' : 'Doubles match'} back>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
            Race to {match.game_point}
          </span>
          <StatusPill status={match.status} />
        </div>

        <SideBlock players={sideA} isWinner={match.winner_side === 'A'} />
        <div className="score-line">
          <span>{match.status === 'scheduled' ? '–' : scoreA}</span>
          <span className="dash">:</span>
          <span>{match.status === 'scheduled' ? '–' : scoreB}</span>
        </div>
        <SideBlock players={sideB} isWinner={match.winner_side === 'B'} />
      </div>

      {match.status === 'scheduled' && (
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 16 }}
          disabled={busy}
          onClick={() => id && run(() => startMatch(id))}
        >
          ▶ Start match
        </button>
      )}

      {match.status === 'in_progress' && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginTop: 0 }}>Update score</div>
          <ScoreStepper label={sideLabel(sideA)} value={scoreA} onChange={setScoreA} />
          <ScoreStepper label={sideLabel(sideB)} value={scoreB} onChange={setScoreB} />
          <button
            className="btn btn-outline btn-block"
            style={{ marginTop: 6 }}
            disabled={busy}
            onClick={() => id && run(() => updateScore(id, scoreA, scoreB))}
          >
            Save score
          </button>

          <div className="section-title">Finish match</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginBottom: 12 }}>
            Save the final score above, then mark the winning side.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => handleFinish('A')}>
              {sideLabel(sideA)} won
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => handleFinish('B')}>
              {sideLabel(sideB)} won
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="error-text" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}

      {match.status !== 'completed' && (
        <button className="btn btn-danger btn-block" style={{ marginTop: 16 }} disabled={busy} onClick={handleDelete}>
          Delete match
        </button>
      )}
    </Layout>
  )
}

function sideLabel(participants: MatchWithParticipants['participants']) {
  return participants.map((p) => p.player.name).join(' & ') || '—'
}

function SideBlock({ players, isWinner }: { players: MatchWithParticipants['participants']; isWinner: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '6px 0' }}>
      <div style={{ display: 'flex' }}>
        {players.map((p, i) => (
          <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -12 }}>
            <PlayerAvatar player={p.player} size={40} />
          </div>
        ))}
      </div>
      <span style={{ fontWeight: isWinner ? 800 : 600, fontSize: '0.95rem' }}>
        {players.map((p) => p.player.name).join(' & ') || '—'}
        {isWinner && ' 🏆'}
      </span>
    </div>
  )
}

function ScoreStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="icon-btn"
          style={{ background: 'var(--line)', color: 'var(--ink)' }}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 24, textAlign: 'center' }}>{value}</span>
        <button
          type="button"
          className="icon-btn"
          style={{ background: 'var(--court-light)', color: 'var(--court)' }}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
