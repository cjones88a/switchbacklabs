-- Simple debug queries to understand the data structure
-- Run these one at a time in Supabase SQL editor

-- 1. Check what season keys exist
SELECT DISTINCT season_key, COUNT(*) as count
FROM public.attempts 
GROUP BY season_key 
ORDER BY season_key;

-- 2. Check the riders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'riders' AND table_schema = 'public';

-- 3. Check if there are any riders with consent
SELECT * FROM public.riders LIMIT 5;

-- 4. Check attempts data structure
SELECT * FROM public.attempts LIMIT 3;
