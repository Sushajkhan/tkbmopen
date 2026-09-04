import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import PlayerAvatar from '../components/PlayerAvatar'
import { fetchAllParticipants, fetchMatches, fetchPlayers } from '../lib/api'
import { computeDoublesRanking, computeSinglesRanking, POINTS } from '../lib/rankings'
import type { Match, MatchParticipant, Player, RankingRow } from '../types'

export default function Rankings() {
  const [tab, setTab] = useState<'singles' | 'doubles'>('singles')
  const [data, setData] = useState<{ players: Player[]; matches: Match[]; participants: MatchParticipant[] } | null>(null)

  useEffect(() => {
    Promise.all([fetchPlayers(), fetchMatches(), fetchAllParticipants()]).then(([players, matches, participants]) =>
      setData({ players, matches, participants }),
    )
  }, [])

  return (
    <Layout
      title="Rankings"
      subtitle={
        tab === 'singles'
          ? `${POINTS.singlesWin} pts a singles win · ${POINTS.doublesWinForSingles} pts via doubles · +${POINTS.championshipBonus} per title run · +${POINTS.matchPlayed} per match played · -${POINTS.lossPenalty} per loss`
          : `${POINTS.doublesWin} pts a win as a pair · +${POINTS.championshipBonus} per title run · +${POINTS.matchPlayed} per match played · -${POINTS.lossPenalty} per loss`
      }
    >
      <div className="tab-row">
        <button className={tab === 'singles' ? 'active' : ''} onClick={() => setTab('singles')}>
          Singles
        </button>
        <button className={tab === 'doubles' ? 'active' : ''} onClick={() => setTab('doubles')}>
          Doubles
        </button>
      </div>

      {!data && <Loading />}

      {data && (
        <RankingList
          rows={tab === 'singles' ? computeSinglesRanking(data) : computeDoublesRanking(data)}
          linkPlayers={tab === 'singles'}
        />
      )}
    </Layout>
  )
}

function RankingList({ rows, linkPlayers }: { rows: RankingRow[]; linkPlayers: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">🏆</div>
        <p>Rankings appear once matches are completed.</p>
      </div>
    )
  }

  return (
    <div className="card">
      {rows.map((row, i) => {
        const rank = i + 1
        const badgeClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : ''
        const content = (
          <div
            className="player-row"
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)', paddingTop: i === 0 ? 10 : 12, justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className={`rank-badge ${badgeClass}`}>#{rank}</div>
              <div style={{ display: 'flex' }}>
                {row.players.map((p, idx) => (
                  <div key={p.id} style={{ marginLeft: idx === 0 ? 0 : -10 }}>
                    <PlayerAvatar player={p} size={34} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{row.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                  {row.wins}W - {row.losses}L · {(row.winRate * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--court)' }}>{row.points} pts</div>
              {row.championships > 0 && (
                <div className="trophy-row" style={{ justifyContent: 'flex-end', marginTop: 3 }}>
                  {Array.from({ length: Math.min(row.championships, 3) }).map((_, t) => (
                    <span key={t}>🏆</span>
                  ))}
                  {row.championships > 3 && <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>×{row.championships}</span>}
                </div>
              )}
            </div>
          </div>
        )
        return linkPlayers && row.players.length === 1 ? (
          <Link key={row.key} to={`/players/${row.players[0].id}`} style={{ display: 'block' }}>
            {content}
          </Link>
        ) : (
          <div key={row.key}>{content}</div>
        )
      })}
    </div>
  )
}
