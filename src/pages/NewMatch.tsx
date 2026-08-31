import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import PlayerAvatar from '../components/PlayerAvatar'
import { createMatch, fetchPlayers } from '../lib/api'
import type { MatchType, Player } from '../types'

export default function NewMatch() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [matchType, setMatchType] = useState<MatchType>('singles')
  const [gamePoint, setGamePoint] = useState(21)
  const [sideA, setSideA] = useState<string[]>([])
  const [sideB, setSideB] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers().then(setPlayers)
  }, [])

  function selectMatchType(type: MatchType) {
    setMatchType(type)
    setSideA([])
    setSideB([])
  }

  const perSide = matchType === 'singles' ? 1 : 2

  function toggle(side: 'A' | 'B', playerId: string) {
    const list = side === 'A' ? sideA : sideB
    const setList = side === 'A' ? setSideA : setSideB
    if (list.includes(playerId)) {
      setList(list.filter((id) => id !== playerId))
    } else if (list.length < perSide) {
      setList([...list, playerId])
    }
  }

  const ready = sideA.length === perSide && sideB.length === perSide

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!ready) return
    setSaving(true)
    setError(null)
    try {
      const match = await createMatch({ matchType, gamePoint, sideA, sideB })
      navigate(`/matches/${match.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create match')
      setSaving(false)
    }
  }

  return (
    <Layout title="New match" back>
      {players.length < 2 && (
        <div className="empty-state">
          <div className="emoji">🎽</div>
          <p>Add at least 2 players before creating a match.</p>
        </div>
      )}

      {players.length >= 2 && (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Match type</label>
            <div className="tab-row" style={{ marginBottom: 0 }}>
              <button type="button" className={matchType === 'singles' ? 'active' : ''} onClick={() => selectMatchType('singles')}>
                Singles
              </button>
              <button type="button" className={matchType === 'doubles' ? 'active' : ''} onClick={() => selectMatchType('doubles')}>
                Doubles
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="gp">Game point (race to)</label>
            <input
              id="gp"
              type="number"
              min={1}
              required
              value={gamePoint}
              onChange={(e) => setGamePoint(Number(e.target.value))}
            />
          </div>

          <PlayerPicker
            label={`Side A ${matchType === 'doubles' ? '(pick 2)' : '(pick 1)'}`}
            players={players.filter((p) => !sideB.includes(p.id))}
            selected={sideA}
            onToggle={(id) => toggle('A', id)}
          />

          <PlayerPicker
            label={`Side B ${matchType === 'doubles' ? '(pick 2)' : '(pick 1)'}`}
            players={players.filter((p) => !sideA.includes(p.id))}
            selected={sideB}
            onToggle={(id) => toggle('B', id)}
          />

          {error && (
            <p className="error-text" style={{ marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={!ready || saving}>
            {saving ? 'Creating…' : 'Create match'}
          </button>
        </form>
      )}
    </Layout>
  )
}

function PlayerPicker({
  label,
  players,
  selected,
  onToggle,
}: {
  label: string
  players: Player[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="chip-grid">
        {players.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`select-chip ${selected.includes(p.id) ? 'selected' : ''}`}
            onClick={() => onToggle(p.id)}
          >
            <PlayerAvatar player={p} size={22} />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
