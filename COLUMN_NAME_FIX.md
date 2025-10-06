# Column Name Fix Required

## Issue
The database column for efforts table is named `leaderboard_type` but queries may be using `leaderboard`.

## Fix Required in Supabase SQL Editor

```sql
-- Check current column name
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'efforts' 
AND column_name LIKE '%leaderboard%';

-- If the column is named 'leaderboard' instead of 'leaderboard_type', rename it:
ALTER TABLE public.efforts 
RENAME COLUMN leaderboard TO leaderboard_type;
```

## Verify Data Exists
```sql
SELECT 
  leaderboard_type,
  COUNT(*) as count
FROM public.efforts
GROUP BY leaderboard_type;
```

Expected output:
- overall: 1
- climbing: X
- descending: Y

