import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerAvatar from '../components/PlayerAvatar'
import PlayerFormModal from '../components/PlayerFormModal'
import StatusPill from '../components/StatusPill'
import { fetchAllParticipants, fetchMatches, fetchPlayer, fetchPlayers, updatePlayer } from '../lib/api'
import { computeDoublesRanking, computeSinglesRanking } from '../lib/rankings'
import type { Match, MatchParticipant, Player } from '../types'

interface Data {
  player: Player
  players: Player[]
  matches: Match[]
  participants: MatchParticipant[]
}

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Data | null>(null)
  const [showEdit, setShowEdit] = useState(false)

  async function load() {
    if (!id) return
    const [player, players, matches, participants] = await Promise.all([
      fetchPlayer(id),
      fetchPlayers(),
      fetchMatches(),
      fetchAllParticipants(),
    ])
    setData({ player, players, matches, participants })
  }

  useEffect(() => {
    load()
  }, [id])

  if (!data) return <Layout title="Player" back><Loading /></Layout>

  const { player, players, matches, participants } = data
  const singles = computeSinglesRanking({ players, matches, participants })
  const doubles = computeDoublesRanking({ players, matches, participants })

  const singlesRow = singles.find((r) => r.key === player.id)
  const singlesRank = singlesRow ? singles.indexOf(singlesRow) + 1 : null
  const doublesTeams = doubles
    .map((row, i) => ({ row, rank: i + 1 }))
    .filter(({ row }) => row.players.some((p) => p.id === player.id))

  const myMatchIds = new Set(participants.filter((p) => p.player_id === player.id).map((p) => p.match_id))
  const myMatches = matches
    .filter((m) => myMatchIds.has(m.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalChampionships = (singlesRow?.championships ?? 0) + doublesTeams.reduce((s, t) => s + t.row.championships, 0)

  return (
    <Layout
      title={player.name}
      back
      headerAction={{ icon: '✎', label: 'Edit player', onClick: () => setShowEdit(true) }}
    >
      <div className="card" style={{ textAlign: 'center' }}>
        <PlayerAvatar player={player} size={84} />
        <h2 style={{ marginTop: 10, fontSize: '1.15rem', fontWeight: 800 }}>{player.name}</h2>
        {totalChampionships > 0 && (
          <div className="trophy-row" style={{ justifyContent: 'center', marginTop: 6 }}>
            {Array.from({ length: totalChampionships }).map((_, i) => (
              <span key={i}>🏆</span>
            ))}
          </div>
        )}
        <div className="stat-grid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-box">
            <div className="num">{singlesRank ?? '–'}</div>
            <div className="label">Rank</div>
          </div>
          <div className="stat-box">
            <div className="num">{singlesRow?.points ?? 0}</div>
            <div className="label">Points</div>
          </div>
          <div className="stat-box">
            <div className="num">{singlesRow?.wins ?? 0}</div>
            <div className="label">Wins</div>
          </div>
          <div className="stat-box">
            <div className="num">{totalChampionships}</div>
            <div className="label">Titles</div>
          </div>
        </div>
      </div>

      {doublesTeams.length > 0 && (
        <>
          <div className="section-title">Doubles teams</div>
          <div className="card">
            {doublesTeams.map(({ row, rank }, i) => (
              <div
                key={row.key}
                className="player-row"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)', paddingTop: i === 0 ? 10 : 12, justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="rank-badge">#{rank}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{row.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      {row.wins}W - {row.losses}L
                      {row.championships > 0 ? ` · ${row.championships}🏆` : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">Match history</div>
      {myMatches.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🎾</div>
          <p>No matches played yet.</p>
        </div>
      )}
      {myMatches.length > 0 && (
        <div className="card">
          {myMatches.map((m, i) => {
            const mine = participants.find((p) => p.match_id === m.id && p.player_id === player.id)
            const won = m.status === 'completed' && mine?.side === m.winner_side
            const opponents = participants
              .filter((p) => p.match_id === m.id && p.player_id !== player.id && p.side !== mine?.side)
              .map((p) => players.find((pl) => pl.id === p.player_id)?.name)
              .filter(Boolean)
              .join(' & ')
            return (
              <Link key={m.id} to={`/matches/${m.id}`} style={{ display: 'block' }}>
                <div
                  className="player-row"
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    paddingTop: i === 0 ? 10 : 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {m.match_type === 'singles' ? 'Singles' : 'Doubles'} vs {opponents || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                      {m.status === 'completed' ? `${m.score_a} - ${m.score_b} · ${won ? 'Won' : 'Lost'}` : 'Not completed'}
                    </div>
                  </div>
                  <StatusPill status={m.status} />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showEdit && (
        <PlayerFormModal
          title="Edit player"
          submitLabel="Save changes"
          initialName={player.name}
          initialImageUrl={player.image_url}
          onClose={() => setShowEdit(false)}
          onSubmit={async ({ name, imageUrl }) => {
            await updatePlayer(player.id, name, imageUrl)
            setShowEdit(false)
            load()
          }}
        />
      )}
    </Layout>
  )
}
