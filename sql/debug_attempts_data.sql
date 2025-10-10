-- Debug: Check what data exists in the attempts table
-- Run this in Supabase SQL editor to see what data we have

-- Check if there are any attempts at all
SELECT COUNT(*) as total_attempts FROM public.attempts;

-- Check the structure and sample data
SELECT 
  rider_id,
  season_key,
  activity_id,
  main_ms,
  climb_sum_ms,
  desc_sum_ms,
  created_at
FROM public.attempts 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if climb_sum_ms and desc_sum_ms are populated
SELECT 
  COUNT(*) as total_rows,
  COUNT(climb_sum_ms) as climb_sum_populated,
  COUNT(desc_sum_ms) as desc_sum_populated
FROM public.attempts;
