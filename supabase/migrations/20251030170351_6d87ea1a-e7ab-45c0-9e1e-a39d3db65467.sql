-- Remove the old trigger that creates profiles immediately on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove the old credits trigger as well
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_credits();

-- Create new function that creates profile AND credits only when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text := 'https://fdlyaasqywmdinyaivmw.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbHlhYXNxeXdtZGlueWFpdm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjcwMTEsImV4cCI6MjA3Njk0MzAxMX0.NZuOsqI9CdhqcKdKIv0zeqcXk68InHbyO5OtLKKFmOk';
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

-- Create trigger on auth.users UPDATE that calls our function
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_confirmed();