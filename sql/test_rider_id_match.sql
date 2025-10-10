-- Test if the rider_id from the cookie matches what's in the database
-- Run this in Supabase SQL editor

-- First, let's see all the rider_ids in the database
SELECT DISTINCT rider_id FROM public.attempts ORDER BY rider_id;

-- Then test the simple view with the specific rider_id we saw
SELECT * FROM public.individual_attempts_simple 
WHERE rider_id = 'f21e1281-cebe-46a3-aa20-3ebcodec0abb'
ORDER BY created_at DESC
LIMIT 10;
