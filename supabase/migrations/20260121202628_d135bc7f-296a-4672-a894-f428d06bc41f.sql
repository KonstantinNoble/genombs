-- Drop obsolete tables
DROP TABLE IF EXISTS public.business_tools_history CASCADE;
DROP TABLE IF EXISTS public.ads_advisor_history CASCADE;

-- Remove obsolete columns from user_credits
ALTER TABLE public.user_credits
DROP COLUMN IF EXISTS ads_deep_analysis_count,
DROP COLUMN IF EXISTS ads_deep_analysis_window_start,
DROP COLUMN IF EXISTS ads_standard_analysis_count,
DROP COLUMN IF EXISTS ads_standard_analysis_window_start,
DROP COLUMN IF EXISTS tools_count,
DROP COLUMN IF EXISTS tools_window_start,
DROP COLUMN IF EXISTS analysis_count,
DROP COLUMN IF EXISTS analysis_window_start,
DROP COLUMN IF EXISTS last_analysis_at,
DROP COLUMN IF EXISTS deep_analysis_count,
DROP COLUMN IF EXISTS deep_analysis_window_start,
DROP COLUMN IF EXISTS standard_analysis_count,
DROP COLUMN IF EXISTS standard_analysis_window_start,
DROP COLUMN IF EXISTS daily_autopilot_generations,
DROP COLUMN IF EXISTS autopilot_generation_reset_date,
DROP COLUMN IF EXISTS market_research_count,
DROP COLUMN IF EXISTS market_research_window_start;