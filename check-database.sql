-- Check current database state
-- Run these queries in Supabase SQL editor to see what's in your database

-- 1. Check if season_windows table exists and has data
SELECT 'season_windows' as table_name, COUNT(*) as row_count 
FROM season_windows;

-- 2. Show all season windows (if any)
SELECT season_key, start_at, end_at 
FROM season_windows 
ORDER BY start_at;

-- 3. Check if attempts table has data
SELECT 'attempts' as table_name, COUNT(*) as row_count 
FROM attempts;

-- 4. Show recent attempts (if any)
SELECT rider_id, season_key, activity_id, main_ms, created_at 
FROM attempts 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Check if oauth_tokens table has data
SELECT 'oauth_tokens' as table_name, COUNT(*) as row_count 
FROM oauth_tokens;

-- 6. Show oauth tokens (if any) - be careful with this in production
SELECT rider_id, expires_at, 
       CASE 
         WHEN expires_at > NOW() THEN 'valid'
         ELSE 'expired'
       END as status
FROM oauth_tokens;

-- 7. Check if riders table has data
SELECT 'riders' as table_name, COUNT(*) as row_count 
FROM riders;

-- 8. Show riders (if any)
SELECT id, firstname, lastname, strava_athlete_id, consent_public 
FROM riders;
