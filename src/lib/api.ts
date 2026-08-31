import { supabase } from './supabaseClient'
import type { Match, MatchParticipant, MatchType, MatchWithParticipants, Player, Side } from '../types'

// ---------- players ----------

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').order('name')
  if (error) throw error
  return data as Player[]
}

export async function fetchPlayer(id: string): Promise<Player> {
  const { data, error } = await supabase.from('players').select('*').eq('id', id).single()
  if (error) throw error
  return data as Player
}

export async function createPlayer(name: string, imageUrl: string | null): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({ name, image_url: imageUrl })
    .select()
    .single()
  if (error) throw error
  return data as Player
}

export async function updatePlayer(id: string, name: string, imageUrl: string | null): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update({ name, image_url: imageUrl })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Player
}

export async function uploadPlayerImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('player-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('player-images').getPublicUrl(path)
  return data.publicUrl
}

// ---------- matches ----------

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Match[]
}

export async function fetchAllParticipants(): Promise<MatchParticipant[]> {
  const { data, error } = await supabase.from('match_participants').select('*')
  if (error) throw error
  return data as MatchParticipant[]
}

export async function fetchMatchWithParticipants(id: string): Promise<MatchWithParticipants> {
  const { data: match, error: matchError } = await supabase.from('matches').select('*').eq('id', id).single()
  if (matchError) throw matchError

  const { data: participants, error: partError } = await supabase
    .from('match_participants')
    .select('*, player:players(*)')
    .eq('match_id', id)
  if (partError) throw partError

  return { ...(match as Match), participants: participants as MatchWithParticipants['participants'] }
}

interface CreateMatchInput {
  matchType: MatchType
  gamePoint: number
  sideA: string[]
  sideB: string[]
}

export async function createMatch({ matchType, gamePoint, sideA, sideB }: CreateMatchInput): Promise<Match> {
  const { data: match, error } = await supabase
    .from('matches')
    .insert({ match_type: matchType, game_point: gamePoint, status: 'scheduled' })
    .select()
    .single()
  if (error) throw error

  const rows = [
    ...sideA.map((player_id) => ({ match_id: match.id, side: 'A' as Side, player_id })),
    ...sideB.map((player_id) => ({ match_id: match.id, side: 'B' as Side, player_id })),
  ]
  const { error: partError } = await supabase.from('match_participants').insert(rows)
  if (partError) throw partError

  return match as Match
}

export async function startMatch(id: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateScore(id: string, scoreA: number, scoreB: number): Promise<void> {
  const { error } = await supabase.from('matches').update({ score_a: scoreA, score_b: scoreB }).eq('id', id)
  if (error) throw error
}

export async function completeMatch(id: string, scoreA: number, scoreB: number, winnerSide: Side): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({
      score_a: scoreA,
      score_b: scoreB,
      winner_side: winnerSide,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}
