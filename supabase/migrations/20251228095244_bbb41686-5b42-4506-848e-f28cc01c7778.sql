-- 1. Drop the view first (depends on business_ideas table)
DROP VIEW IF EXISTS public.ideas_with_stats;

-- 2. Drop tables (with CASCADE for foreign key dependencies)
DROP TABLE IF EXISTS public.idea_comments CASCADE;
DROP TABLE IF EXISTS public.idea_ratings CASCADE;
DROP TABLE IF EXISTS public.business_ideas CASCADE;

-- 3. Drop database functions related to ideas
DROP FUNCTION IF EXISTS public.check_idea_post_limit(uuid);
DROP FUNCTION IF EXISTS public.get_remaining_idea_posts(uuid);
DROP FUNCTION IF EXISTS public.get_next_idea_post_time(uuid);
DROP FUNCTION IF EXISTS public.record_idea_post(uuid);

-- 4. Remove unused columns from user_credits table
ALTER TABLE public.user_credits 
  DROP COLUMN IF EXISTS last_idea_post_at,
  DROP COLUMN IF EXISTS comment_count,
  DROP COLUMN IF EXISTS comment_window_start;