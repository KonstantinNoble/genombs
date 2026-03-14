-- Fix RLS policies - disable to allow dashboard access
-- User isolation is handled at application level (Dashboard filters by user_id)

-- Disable RLS for gateway_cache_entries
ALTER TABLE public.gateway_cache_entries DISABLE ROW LEVEL SECURITY;

-- Disable RLS for gateway_request_logs
ALTER TABLE public.gateway_request_logs DISABLE ROW LEVEL SECURITY;

