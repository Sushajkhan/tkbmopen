import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerFormModal from '../components/PlayerFormModal'
import PlayerAvatar from '../components/PlayerAvatar'
import { createPlayer, fetchPlayers } from '../lib/api'
import type { Player } from '../types'

export default function Players() {
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  async function load() {
    setPlayers(await fetchPlayers())
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Layout title="Players" subtitle={players ? `${players.length} registered` : undefined}>
      {players === null && <Loading />}

      {players !== null && players.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🎽</div>
          <p>No players yet. Add your first player to get started.</p>
        </div>
      )}

      {players !== null && players.length > 0 && (
        <div className="card">
          {players.map((p, i) => (
            <Link key={p.id} to={`/players/${p.id}`} style={{ display: 'block' }}>
              <div className="player-row" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)', paddingTop: i === 0 ? 10 : 12 }}>
                <PlayerAvatar player={p} size={44} />
                <div style={{ fontWeight: 700 }}>{p.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <button className="btn btn-accent fab" onClick={() => setShowAdd(true)}>
        + Add player
      </button>

      {showAdd && (
        <PlayerFormModal
          title="Add player"
          submitLabel="Add player"
          onClose={() => setShowAdd(false)}
          onSubmit={async ({ name, imageUrl }) => {
            await createPlayer(name, imageUrl)
            setShowAdd(false)
            load()
          }}
        />
      )}
    </Layout>
  )
}
