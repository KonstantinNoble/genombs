-- Drop business_ideas_history table completely
DROP TABLE IF EXISTS public.business_ideas_history CASCADE;

-- Remove ideas-related columns from user_credits
ALTER TABLE public.user_credits 
DROP COLUMN IF EXISTS ideas_window_start,
DROP COLUMN IF EXISTS ideas_count;