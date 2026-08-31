-- Tennis Match Manager - Supabase schema
-- Run this whole file once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ---------- players ----------
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- matches ----------
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  match_type text not null check (match_type in ('singles', 'doubles')),
  game_point integer not null default 21,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed')),
  score_a integer not null default 0,
  score_b integer not null default 0,
  winner_side text check (winner_side in ('A', 'B')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- ---------- match_participants ----------
create table if not exists match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  player_id uuid not null references players(id) on delete cascade
);

create index if not exists match_participants_match_id_idx on match_participants(match_id);
create index if not exists match_participants_player_id_idx on match_participants(player_id);

-- ---------- row level security ----------
-- This app has a single shared login: any authenticated user (there should only
-- ever be one) can read and write everything. Anonymous (logged-out) access is blocked.
alter table players enable row level security;
alter table matches enable row level security;
alter table match_participants enable row level security;

create policy "players_all_authenticated" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "matches_all_authenticated" on matches
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "match_participants_all_authenticated" on match_participants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- storage bucket for player photos ----------
insert into storage.buckets (id, name, public)
values ('player-images', 'player-images', true)
on conflict (id) do nothing;

create policy "player_images_public_read" on storage.objects
  for select using (bucket_id = 'player-images');

create policy "player_images_authenticated_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'player-images');

create policy "player_images_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'player-images');

create policy "player_images_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'player-images');

-- ---------- after running this ----------
-- Create the single login user in Supabase Dashboard > Authentication > Users > Add user
-- (email + password, "auto confirm" checked). Use those credentials to sign in to the app.
