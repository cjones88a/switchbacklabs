-- Debug 2025 race season data
-- Run this in Supabase SQL editor

-- Check what data exists for 2025 race season
SELECT 
  season_key,
  activity_id,
  main_ms,
  climb_sum_ms,
  desc_sum_ms,
  created_at,
  -- Show the calculated race year
  CASE
    WHEN season_key LIKE '%SPRING' OR season_key LIKE '%SUMMER'
      THEN (split_part(season_key, '_', 1)::int - 1)
    ELSE split_part(season_key, '_', 1)::int
  END as calculated_race_year
FROM public.attempts 
WHERE rider_id = 'f21e1281-cebe-46a3-aa20-3ebcodec0abb'
  AND (
    season_key LIKE '2025_%' OR 
    season_key LIKE '2026_%'
  )
ORDER BY season_key;

-- Check if there are any 2026 Spring attempts
SELECT 
  season_key,
  activity_id,
  main_ms,
  created_at
FROM public.attempts 
WHERE rider_id = 'f21e1281-cebe-46a3-aa20-3ebcodec0abb'
  AND season_key = '2026_SPRING';
