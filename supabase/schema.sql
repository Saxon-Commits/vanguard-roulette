-- ============================================================
-- Vanguard Roulette — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- Rooms
create table if not exists rooms (
  id              uuid        primary key default gen_random_uuid(),
  code            text        not null unique,
  host_player_id  uuid,
  status          text        not null default 'lobby'
                              check (status in ('lobby', 'active', 'revealing')),
  created_at      timestamptz not null default now()
);

-- Players
create table if not exists players (
  id              uuid        primary key,
  room_id         uuid        not null references rooms(id) on delete cascade,
  gamertag        text        not null,
  is_host         boolean     not null default false,
  vote_target_id  uuid,
  joined_at       timestamptz not null default now()
);

-- Game State (one row per room)
create table if not exists game_state (
  id            uuid        primary key default gen_random_uuid(),
  room_id       uuid        not null unique references rooms(id) on delete cascade,
  round         integer     not null default 1,
  saboteur_id   uuid,
  phase         text        not null default 'idle'
                            check (phase in ('idle', 'spinning', 'active', 'voting', 'revealed')),
  revealed_at   timestamptz
);

-- Row Level Security
alter table rooms       enable row level security;
alter table players     enable row level security;
alter table game_state  enable row level security;

create policy "anon_all_rooms"       on rooms       for all to anon using (true) with check (true);
create policy "anon_all_players"     on players     for all to anon using (true) with check (true);
create policy "anon_all_game_state"  on game_state  for all to anon using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table game_state;

-- Indexes
create index if not exists idx_players_room_id    on players(room_id);
create index if not exists idx_game_state_room_id on game_state(room_id);
create index if not exists idx_rooms_code         on rooms(code);
