-- Test the simple individual attempts view
-- Run this in Supabase SQL editor

-- First, let's see what rider_ids exist
SELECT DISTINCT rider_id FROM public.attempts LIMIT 5;

-- Then test the simple view
SELECT * FROM public.individual_attempts_simple LIMIT 10;

-- Test with a specific rider_id (replace with your actual rider_id)
-- SELECT * FROM public.individual_attempts_simple WHERE rider_id = 'your-rider-id-here' LIMIT 10;
