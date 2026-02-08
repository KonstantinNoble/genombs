
-- =============================================
-- SYNOPTAS CLEANUP: Drop all feature tables, functions, and clean up user_credits
-- Order: Children first to avoid FK conflicts
-- =============================================

-- 1. Drop child tables first
DROP TABLE IF EXISTS public.decision_audit_log CASCADE;
DROP TABLE IF EXISTS public.decision_records CASCADE;
DROP TABLE IF EXISTS public.experiment_tasks CASCADE;
DROP TABLE IF EXISTS public.experiment_checkpoints CASCADE;
DROP TABLE IF EXISTS public.experiment_evidence CASCADE;
DROP TABLE IF EXISTS public.experiments CASCADE;
DROP TABLE IF EXISTS public.validation_analyses CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- 2. Drop feature-specific database functions
DROP FUNCTION IF EXISTS public.get_user_dashboard_stats(uuid);
DROP FUNCTION IF EXISTS public.check_and_update_analysis_limit(uuid);
DROP FUNCTION IF EXISTS public.increment_validation_count(uuid, boolean);
DROP FUNCTION IF EXISTS public.get_remaining_comments(uuid);
DROP FUNCTION IF EXISTS public.check_comment_limit(uuid);
DROP FUNCTION IF EXISTS public.get_next_comment_time(uuid);
DROP FUNCTION IF EXISTS public.log_decision_action(text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.is_team_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_team_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_team_owner(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_owned_teams(uuid);
DROP FUNCTION IF EXISTS public.cleanup_expired_invitations();

-- 3. Clean up user_credits: remove validation-specific columns
ALTER TABLE public.user_credits DROP COLUMN IF EXISTS validation_count;
ALTER TABLE public.user_credits DROP COLUMN IF EXISTS validation_window_start;
ALTER TABLE public.user_credits DROP COLUMN IF EXISTS last_reset_date;

-- 4. Drop team_role enum (no longer needed)
DROP TYPE IF EXISTS public.team_role CASCADE;
