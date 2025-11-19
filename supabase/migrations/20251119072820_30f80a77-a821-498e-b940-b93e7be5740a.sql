-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their own ads history" ON public.ads_advisor_history;
DROP POLICY IF EXISTS "Users can insert their own ads history" ON public.ads_advisor_history;
DROP POLICY IF EXISTS "Users can delete their own ads history" ON public.ads_advisor_history;

-- Drop index
DROP INDEX IF EXISTS idx_ads_advisor_user_created;

-- Drop table
DROP TABLE IF EXISTS public.ads_advisor_history;