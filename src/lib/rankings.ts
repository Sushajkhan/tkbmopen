import type { Match, MatchParticipant, Player, RankingRow } from '../types'

interface Ctx {
  players: Player[]
  matches: Match[]
  participants: MatchParticipant[]
}

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((i) => [i.id, i]))

/** Points awarded per result. A singles win is worth more than a doubles win credited
 * toward the singles ranking, since it's an individual result; championships add a bonus.
 * matchPlayed rewards activity (every completed match, win or lose) and lossPenalty docks
 * points per loss, so total matches played and losses both move the ranking, not just wins. */
export const POINTS = {
  singlesWin: 3,
  doublesWinForSingles: 2,
  doublesWin: 3,
  championshipBonus: 5,
  matchPlayed: 0.5,
  lossPenalty: 1,
}

/** Consecutive-win championships: every run of 3 straight wins earns one championship
 * and resets the counter, so 6 straight wins = 2 championships, 4 straight = 1 (+1 live streak). */
function streakStats(resultsChronological: boolean[]) {
  let streak = 0
  let championships = 0
  for (const won of resultsChronological) {
    if (won) {
      streak++
      if (streak >= 3) {
        championships++
        streak = 0
      }
    } else {
      streak = 0
    }
  }
  return { championships, currentStreak: streak }
}

function sortRows(rows: RankingRow[]) {
  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    if (b.championships !== a.championships) return b.championships - a.championships
    return a.label.localeCompare(b.label)
  })
}

/** Singles ranking: every player's own singles matches AND their doubles matches both
 * count toward wins/points here. Championships shown are singles-only win streaks. */
export function computeSinglesRanking({ players, matches, participants }: Ctx): RankingRow[] {
  const playersById = byId(players)
  const completed = matches
    .filter((m) => m.status === 'completed' && m.winner_side)
    .sort((a, b) => new Date(a.completed_at ?? a.created_at).getTime() - new Date(b.completed_at ?? b.created_at).getTime())

  const participantsByMatch = new Map<string, MatchParticipant[]>()
  for (const p of participants) {
    if (!participantsByMatch.has(p.match_id)) participantsByMatch.set(p.match_id, [])
    participantsByMatch.get(p.match_id)!.push(p)
  }

  const rows = new Map<string, RankingRow>()
  const singlesResultsByPlayer = new Map<string, boolean[]>()

  for (const match of completed) {
    const parts = participantsByMatch.get(match.id) ?? []
    for (const part of parts) {
      const player = playersById.get(part.player_id)
      if (!player) continue
      if (!rows.has(player.id)) {
        rows.set(player.id, {
          key: player.id,
          label: player.name,
          players: [player],
          wins: 0,
          losses: 0,
          matches: 0,
          winRate: 0,
          championships: 0,
          currentStreak: 0,
          points: 0,
        })
      }
      const row = rows.get(player.id)!
      const won = part.side === match.winner_side
      row.matches++
      if (won) {
        row.wins++
        row.points += match.match_type === 'singles' ? POINTS.singlesWin : POINTS.doublesWinForSingles
      } else {
        row.losses++
      }

      if (match.match_type === 'singles') {
        if (!singlesResultsByPlayer.has(player.id)) singlesResultsByPlayer.set(player.id, [])
        singlesResultsByPlayer.get(player.id)!.push(won)
      }
    }
  }

  for (const row of rows.values()) {
    row.winRate = row.matches ? row.wins / row.matches : 0
    const { championships, currentStreak } = streakStats(singlesResultsByPlayer.get(row.key) ?? [])
    row.championships = championships
    row.currentStreak = currentStreak
    row.points += championships * POINTS.championshipBonus
    row.points += row.matches * POINTS.matchPlayed
    row.points -= row.losses * POINTS.lossPenalty
  }

  return sortRows(Array.from(rows.values()))
}

/** Doubles ranking: ranks fixed pairs (a specific two players who played together). */
export function computeDoublesRanking({ players, matches, participants }: Ctx): RankingRow[] {
  const playersById = byId(players)
  const completed = matches
    .filter((m) => m.match_type === 'doubles' && m.status === 'completed' && m.winner_side)
    .sort((a, b) => new Date(a.completed_at ?? a.created_at).getTime() - new Date(b.completed_at ?? b.created_at).getTime())

  const participantsByMatch = new Map<string, MatchParticipant[]>()
  for (const p of participants) {
    if (!participantsByMatch.has(p.match_id)) participantsByMatch.set(p.match_id, [])
    participantsByMatch.get(p.match_id)!.push(p)
  }

  const rows = new Map<string, RankingRow>()
  const resultsByTeam = new Map<string, boolean[]>()

  for (const match of completed) {
    const parts = participantsByMatch.get(match.id) ?? []
    const bySide: Record<string, string[]> = { A: [], B: [] }
    for (const part of parts) bySide[part.side]?.push(part.player_id)

    for (const side of ['A', 'B'] as const) {
      const ids = bySide[side]
      if (ids.length !== 2) continue
      const teamPlayers = ids
        .map((id) => playersById.get(id))
        .filter((p): p is Player => Boolean(p))
      if (teamPlayers.length !== 2) continue
      const key = [...ids].sort().join('|')
      if (!rows.has(key)) {
        rows.set(key, {
          key,
          label: teamPlayers.map((p) => p.name).join(' & '),
          players: teamPlayers,
          wins: 0,
          losses: 0,
          matches: 0,
          winRate: 0,
          championships: 0,
          currentStreak: 0,
          points: 0,
        })
      }
      const row = rows.get(key)!
      const won = side === match.winner_side
      row.matches++
      if (won) {
        row.wins++
        row.points += POINTS.doublesWin
      } else {
        row.losses++
      }

      if (!resultsByTeam.has(key)) resultsByTeam.set(key, [])
      resultsByTeam.get(key)!.push(won)
    }
  }

  for (const row of rows.values()) {
    row.winRate = row.matches ? row.wins / row.matches : 0
    const { championships, currentStreak } = streakStats(resultsByTeam.get(row.key) ?? [])
    row.championships = championships
    row.currentStreak = currentStreak
    row.points += championships * POINTS.championshipBonus
    row.points += row.matches * POINTS.matchPlayed
    row.points -= row.losses * POINTS.lossPenalty
  }

  return sortRows(Array.from(rows.values()))
}
