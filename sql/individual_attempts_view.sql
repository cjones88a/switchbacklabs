-- Migration: Create view for individual attempts with climb/descent details
-- Run this in Supabase SQL editor

-- Create a view that shows individual attempts with season and race year context
create or replace view public.individual_attempts as
select
  a.rider_id,
  a.season_key,
  -- Derive race_year from the season key:
  -- FALL stays same; WINTER/SPRING/SUMMER roll back to the prior Fall year.
  case
    when a.season_key like '%WINTER' or a.season_key like '%SPRING' or a.season_key like '%SUMMER'
      then (split_part(a.season_key, '_', 1)::int - 1)
    else split_part(a.season_key, '_', 1)::int
  end as race_year,
  a.activity_id,
  a.main_ms,
  a.climb_sum_ms,
  a.desc_sum_ms,
  a.created_at,
  -- Add season name for display
  case
    when a.season_key like '%FALL' then 'Fall'
    when a.season_key like '%WINTER' then 'Winter'
    when a.season_key like '%SPRING' then 'Spring'
    when a.season_key like '%SUMMER' then 'Summer'
    else 'Unknown'
  end as season_name,
  -- Add year for display
  split_part(a.season_key, '_', 1)::int as season_year
from public.attempts a
order by a.rider_id, race_year desc, 
  case
    when a.season_key like '%FALL' then 1
    when a.season_key like '%WINTER' then 2
    when a.season_key like '%SPRING' then 3
    when a.season_key like '%SUMMER' then 4
    else 5
  end, a.main_ms asc;
