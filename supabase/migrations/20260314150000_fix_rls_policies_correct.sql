-- Fix RLS policies to work correctly with Dashboard and Backend
-- The original "FOR ALL USING (...)" policy was too restrictive and blocked SELECT queries

-- Drop overly restrictive policies
DROP POLICY IF EXISTS cache_entries_user_isolation ON public.gateway_cache_entries;
DROP POLICY IF EXISTS request_logs_user_isolation ON public.gateway_request_logs;

-- ===============================================================================
-- GATEWAY_CACHE_ENTRIES Policies
-- ===============================================================================

-- Allow authenticated users to SELECT their own cache entries
CREATE POLICY cache_entries_select ON public.gateway_cache_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to do everything (needed for edge functions)
CREATE POLICY cache_entries_service_role ON public.gateway_cache_entries
    FOR ALL
    USING (current_setting('role') = 'service_role');

-- ===============================================================================
-- GATEWAY_REQUEST_LOGS Policies
-- ===============================================================================

-- Allow authenticated users to SELECT their own logs
CREATE POLICY logs_select ON public.gateway_request_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to do everything (needed for edge functions)
CREATE POLICY logs_service_role ON public.gateway_request_logs
    FOR ALL
    USING (current_setting('role') = 'service_role');
