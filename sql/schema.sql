create extension if not exists pgcrypto;

create table if not exists riders (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  firstname text,
  lastname text,
  profile text,
  created_at timestamptz default now()
);

create table if not exists oauth_tokens (
  rider_id uuid primary key references riders(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null
);

create table if not exists segments (
  id bigint primary key,
  label text not null check (label in ('MAIN','CLIMB_1','CLIMB_2','DESC_1','DESC_2','DESC_3'))
);

insert into segments (id,label) values
  (7977451,'MAIN'),
  (9589287,'CLIMB_1'),
  (18229887,'CLIMB_2'),
  (21056071,'DESC_1'),
  (19057702,'DESC_2'),
  (13590275,'DESC_3')
on conflict (id) do nothing;

create table if not exists season_windows (
  season_key text primary key, -- e.g., 2025_FALL
  start_at timestamptz not null,
  end_at timestamptz not null
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references riders(id) on delete cascade,
  season_key text not null references season_windows(season_key) on delete cascade,
  activity_id bigint not null,
  main_ms integer not null,
  climb_sum_ms integer,
  desc_sum_ms integer,
  created_at timestamptz default now(),
  unique (rider_id, season_key)
);

create index if not exists idx_attempts_season_main on attempts (season_key, main_ms);
