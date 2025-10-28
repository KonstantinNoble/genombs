-- Drop stock analysis history table as it's no longer needed
DROP TABLE IF EXISTS public.stock_analysis_history;

-- Drop the check_and_update_analysis_limit function if it exists
DROP FUNCTION IF EXISTS public.check_and_update_analysis_limit();