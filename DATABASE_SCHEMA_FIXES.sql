-- Fix 1: Add effort_id column and unique index for proper upserting
ALTER TABLE public.efforts
ADD COLUMN IF NOT EXISTS effort_id bigint;

CREATE UNIQUE INDEX IF NOT EXISTS efforts_effort_id_uidx
ON public.efforts (effort_id);

-- Fix 2: Add helpful index for leaderboard queries
CREATE INDEX IF NOT EXISTS efforts_board_seg_stage_idx
ON public.efforts (leaderboard_type, segment_id, stage_index, participant_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'efforts' 
ORDER BY ordinal_position;
