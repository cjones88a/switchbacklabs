-- Setup for comprehensive My Times feature
-- Run this in Supabase SQL editor

-- 1. Create rider_yearly_times table if it doesn't exist
create table if not exists rider_yearly_times(
  rider_id uuid not null,
  race_year int not null,
  fall_ms int4,
  winter_ms int4,
  spring_ms int4,
  summer_ms int4,
  primary key (rider_id, race_year)
);

-- 2. Create season_windows table if it doesn't exist
create table if not exists season_windows(
  season_key text primary key,
  start_at   timestamptz not null,
  end_at     timestamptz not null
);

-- 3. Add helpful indexes
create index if not exists idx_sw_start_end on season_windows(start_at, end_at);
create index if not exists idx_attempts_rider_season on attempts(rider_id, season_key);
create index if not exists idx_yearly_times_rider_year on rider_yearly_times(rider_id, race_year);

-- 4. Seed comprehensive season windows (2014-2030)
-- Approx season windows for 2014..2030 (coarse; adjust later in Admin)
-- Fall: Sep 15–Oct 15, Winter: Jan 1–Jan 31, Spring: Mar 15–Apr 15, Summer: Jun 15–Jul 15
-- Idempotent upserts.

do $$
declare y int;
begin
  for y in 2014..2030 loop
    -- FALL of year y
    insert into season_windows(season_key, start_at, end_at)
    values (concat(y,'_FALL'),   make_timestamptz(y,9,15,0,0,0,'UTC'), make_timestamptz(y,10,15,23,59,59,'UTC'))
    on conflict (season_key) do nothing;

    -- WINTER, SPRING, SUMMER belong to race-year y but live in y+1 on calendar
    insert into season_windows(season_key, start_at, end_at)
    values (concat(y,'_WINTER'), make_timestamptz(y+1,1,1,0,0,0,'UTC'),  make_timestamptz(y+1,1,31,23,59,59,'UTC'))
    on conflict (season_key) do nothing;

    insert into season_windows(season_key, start_at, end_at)
    values (concat(y,'_SPRING'), make_timestamptz(y+1,3,15,0,0,0,'UTC'), make_timestamptz(y+1,4,15,23,59,59,'UTC'))
    on conflict (season_key) do nothing;

    insert into season_windows(season_key, start_at, end_at)
    values (concat(y,'_SUMMER'), make_timestamptz(y+1,6,15,0,0,0,'UTC'), make_timestamptz(y+1,7,15,23,59,59,'UTC'))
    on conflict (season_key) do nothing;
  end loop;
end$$;

-- 5. Verify the data
select 'season_windows' as table_name, count(*) as row_count from season_windows;
select 'rider_yearly_times' as table_name, count(*) as row_count from rider_yearly_times;
select 'attempts' as table_name, count(*) as row_count from attempts;

-- 6. Show sample season windows
select season_key, start_at, end_at 
from season_windows 
order by start_at 
limit 10;
