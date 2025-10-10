-- Simple version of individual attempts view for debugging
-- Run this in Supabase SQL editor

CREATE OR REPLACE VIEW public.individual_attempts_simple AS
SELECT
  a.rider_id,
  a.season_key,
  a.activity_id,
  a.main_ms,
  a.climb_sum_ms,
  a.desc_sum_ms,
  a.created_at,
  -- Simple season name
  CASE
    WHEN a.season_key LIKE '%FALL' THEN 'Fall'
    WHEN a.season_key LIKE '%WINTER' THEN 'Winter'
    WHEN a.season_key LIKE '%SPRING' THEN 'Spring'
    WHEN a.season_key LIKE '%SUMMER' THEN 'Summer'
    ELSE 'Unknown'
  END as season_name,
  -- Race year: FALL stays same; WINTER/SPRING/SUMMER roll back to prior Fall year
  CASE
    WHEN a.season_key LIKE '%WINTER' OR a.season_key LIKE '%SPRING' OR a.season_key LIKE '%SUMMER'
      THEN (split_part(a.season_key, '_', 1)::int - 1)
    ELSE split_part(a.season_key, '_', 1)::int
  END as race_year,
  split_part(a.season_key, '_', 1)::int as season_year
FROM public.attempts a
ORDER BY a.rider_id, a.created_at DESC;

-- Test the simple view
SELECT * FROM public.individual_attempts_simple LIMIT 10;
