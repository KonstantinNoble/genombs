/*
  # Fix Database URLs - Remove Bolt References

  1. Changes
    - Update all database triggers to use correct Lovable Supabase URL
    - Replace old Bolt database URL (fdlyaasqywmdinyaivmw) with Lovable URL (cywblvdydcmyfdbofmix)
    - Update all function calls to use correct environment
  
  2. Security
    - Maintains existing RLS policies
    - No data loss
*/

-- Recreate the function with correct Lovable URL
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text := 'https://cywblvdydcmyfdbofmix.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d2JsdmR5ZGNteWZkYm9mbWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjIxNDIsImV4cCI6MjA3ODA5ODE0Mn0.aSHKaYmLDljUwmK-Z2ZvkK14S1HiyykRbizS4vKDHH4';
BEGIN
  -- Only proceed if email was just confirmed (changed from NULL to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Insert profile
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Insert user credits
    INSERT INTO public.user_credits (user_id)
    VALUES (NEW.id);
    
    -- Sync to Resend (call edge function in background, non-blocking)
    PERFORM
      net.http_post(
        url := supabase_url || '/functions/v1/sync-user-to-resend',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || supabase_anon_key
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'user_id', NEW.id
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;