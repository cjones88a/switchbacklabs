-- Migration: Add views and indexes for rider season bests and yearly times
-- Run this in Supabase SQL editor

-- 1. Index to speed up best-time selection
-- Speeds up DISTINCT ON / filtering by rider + season + time
create index if not exists idx_attempts_rider_season_time
  on public.attempts (rider_id, season_key, main_ms, created_at);

-- 2. View: best attempt per rider per season (picks the fastest main time)
create or replace view public.rider_season_best_attempt as
select distinct on (a.rider_id, a.season_key)
       a.rider_id,
       a.season_key,
       a.activity_id,
       a.main_ms,
       a.climb_sum_ms,
       a.desc_sum_ms,
       a.created_at
from public.attempts a
order by a.rider_id, a.season_key, a.main_ms asc, a.created_at asc;

-- 3. View: pivot best season times into race-year rows
create or replace view public.rider_yearly_times as
with norm as (
  select
    rider_id,
    season_key,
    -- Derive race_year from the season key:
    -- FALL stays same; WINTER/SPRING/SUMMER roll back to the prior Fall year.
    case
      when season_key like '%WINTER' or season_key like '%SPRING' or season_key like '%SUMMER'
        then (split_part(season_key, '_', 1)::int - 1)
      else split_part(season_key, '_', 1)::int
    end as race_year,
    main_ms,
    activity_id
  from public.rider_season_best_attempt
)
select
  rider_id,
  race_year,
  min(main_ms) filter (where season_key like '%FALL')   as fall_ms,
  min(main_ms) filter (where season_key like '%WINTER') as winter_ms,
  min(main_ms) filter (where season_key like '%SPRING') as spring_ms,
  min(main_ms) filter (where season_key like '%SUMMER') as summer_ms
from norm
group by rider_id, race_year
order by rider_id, race_year desc;
