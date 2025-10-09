-- Migration: Update rider_yearly_times view to include total, climb_sum, and desc_sum
-- Run this in Supabase SQL editor

-- Update the view to include climb_sum_ms and desc_sum_ms columns
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
    climb_sum_ms,
    desc_sum_ms,
    activity_id
  from public.rider_season_best_attempt
)
select
  rider_id,
  race_year,
  -- Main times (fastest per season)
  min(main_ms) filter (where season_key like '%FALL')   as fall_ms,
  min(main_ms) filter (where season_key like '%WINTER') as winter_ms,
  min(main_ms) filter (where season_key like '%SPRING') as spring_ms,
  min(main_ms) filter (where season_key like '%SUMMER') as summer_ms,
  -- Total time (sum of all seasons for the race year)
  sum(main_ms) as total_ms,
  -- Climb sum (from the activity with the fastest main time)
  min(climb_sum_ms) filter (where season_key like '%FALL')   as fall_climb_ms,
  min(climb_sum_ms) filter (where season_key like '%WINTER') as winter_climb_ms,
  min(climb_sum_ms) filter (where season_key like '%SPRING') as spring_climb_ms,
  min(climb_sum_ms) filter (where season_key like '%SUMMER') as summer_climb_ms,
  sum(climb_sum_ms) as total_climb_ms,
  -- Descent sum (from the activity with the fastest main time)
  min(desc_sum_ms) filter (where season_key like '%FALL')   as fall_desc_ms,
  min(desc_sum_ms) filter (where season_key like '%WINTER') as winter_desc_ms,
  min(desc_sum_ms) filter (where season_key like '%SPRING') as spring_desc_ms,
  min(desc_sum_ms) filter (where season_key like '%SUMMER') as summer_desc_ms,
  sum(desc_sum_ms) as total_desc_ms
from norm
group by rider_id, race_year
order by rider_id, race_year desc;
