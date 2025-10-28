-- Drop the old overloaded function that takes two parameters
DROP FUNCTION IF EXISTS public.check_and_update_analysis_limit(p_user_id uuid, p_analysis_type text);