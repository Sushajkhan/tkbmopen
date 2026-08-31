export type MatchType = 'singles' | 'doubles'
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed'
export type Side = 'A' | 'B'

export interface Player {
  id: string
  name: string
  image_url: string | null
  created_at: string
}

export interface Match {
  id: string
  match_type: MatchType
  game_point: number
  status: MatchStatus
  score_a: number
  score_b: number
  winner_side: Side | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface MatchParticipant {
  id: string
  match_id: string
  side: Side
  player_id: string
}

export interface MatchWithParticipants extends Match {
  participants: (MatchParticipant & { player: Player })[]
}

export interface RankingRow {
  key: string
  label: string
  players: Player[]
  wins: number
  losses: number
  matches: number
  winRate: number
  championships: number
  currentStreak: number
  points: number
}
