-- =============================================
-- PHASE 1: Critical Security Fixes - RLS Policies
-- =============================================

-- 1. user_credits: Prevent users from deleting their own credit records
CREATE POLICY "Users cannot delete their own credits" 
ON public.user_credits 
FOR DELETE 
TO authenticated 
USING (false);

-- 2. registration_attempts: Restrict all access to service_role only
-- First, enable RLS if not already enabled
ALTER TABLE public.registration_attempts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might allow access
DROP POLICY IF EXISTS "Service role only for registration_attempts" ON public.registration_attempts;
DROP POLICY IF EXISTS "No access for regular users" ON public.registration_attempts;

-- Create service-role-only policy (service_role bypasses RLS, but this documents intent)
-- Block authenticated and anon users from all operations
CREATE POLICY "Block authenticated users from registration_attempts" 
ON public.registration_attempts 
FOR ALL 
TO authenticated 
USING (false)
WITH CHECK (false);

CREATE POLICY "Block anon users from registration_attempts" 
ON public.registration_attempts 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

-- =============================================
-- PHASE 2: Scalability Fix - Atomic Credit Updates
-- =============================================

-- Create atomic function for validation count increment (prevents race conditions)
CREATE OR REPLACE FUNCTION public.increment_validation_count(
  user_uuid UUID, 
  reset_window BOOLEAN DEFAULT FALSE
)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF reset_window THEN
    UPDATE public.user_credits 
    SET 
      validation_count = 1, 
      validation_window_start = NOW(),
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    UPDATE public.user_credits 
    SET 
      validation_count = COALESCE(validation_count, 0) + 1,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$$;