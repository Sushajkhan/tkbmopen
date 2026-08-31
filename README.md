# TKBM Open — Tennis Tournament Manager

A mobile-first (works great on desktop too) React + Supabase app for running a local tennis
tournament: manage players, schedule singles/doubles matches, track live scores, and see
singles/doubles rankings with automatic "3 wins in a row" championships.

## Stack

- React 19 + TypeScript + Vite
- React Router
- Supabase (Postgres + Auth + Storage) — single shared login, no self-signup

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates
   the `players`, `matches`, `match_participants` tables, row-level-security policies, and a public
   `player-images` storage bucket for photos.
3. Open **Authentication → Users → Add user**, create the one login (email + password) that you and
   anyone helping you run the tournament will share, and check "Auto confirm user".
4. Open **Project Settings → API** and copy the **Project URL** and **anon public** key.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run it

```bash
npm install
npm run dev
```

Open the printed local URL, sign in with the one login you created in step 1.3, add players, and
start scheduling matches.

## How rankings & championships work

- **Singles ranking** — every player's wins from *both* their singles matches and any doubles
  matches they played in count toward their singles ranking, sorted by points → wins → win rate.
- **Doubles ranking** — ranks each specific pairing (e.g. "Alex & Sam") by their wins together as a
  team, based only on doubles matches that exact pair played.
- **Championships** — every time a player (in singles) or a doubles pair wins 3 matches in a row,
  they earn a 🏆. The streak resets after the title so a 6-match win streak earns 2 championships.
  Championships and current live streaks are shown on the player profile and rankings pages.

## Project structure

```
src/
  components/   Layout, bottom nav, avatars, status pills, modal
  context/      AuthContext (Supabase session)
  lib/          supabaseClient, api.ts (data access), rankings.ts (ranking/championship logic)
  pages/        Login, Home, Players, PlayerProfile, Matches, NewMatch, MatchDetail, Rankings
  types/        Shared TypeScript types
supabase/
  schema.sql    Tables, RLS policies, storage bucket
```
