-- Debug leaderboard data
-- Run this in Supabase SQL editor

-- Check what season keys exist in attempts table
SELECT DISTINCT season_key, COUNT(*) as count
FROM public.attempts 
GROUP BY season_key 
ORDER BY season_key;

-- Check what riders have consent_public = true
SELECT id, firstname, lastname, consent_public
FROM public.riders 
WHERE consent_public = true;

-- Check attempts for current year (2025)
SELECT 
  a.rider_id,
  a.season_key,
  a.main_ms,
  a.climb_sum_ms,
  a.desc_sum_ms,
  r.firstname,
  r.lastname,
  r.consent_public
FROM public.attempts a
LEFT JOIN public.riders r ON a.rider_id = r.id
WHERE a.season_key LIKE '2025_%'
ORDER BY a.season_key, a.main_ms;
