-- Improve trigger to handle more edge cases
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text := 'https://fdlyaasqywmdinyaivmw.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbHlhYXNxeXdtZGlueWFpdm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjcwMTEsImV4cCI6MjA3Njk0MzAxMX0.NZuOsqI9CdhqcKdKIv0zeqcXk68InHbyO5OtLKKFmOk';
BEGIN
  -- Trigger fires when email is confirmed OR if confirmed user has no profile yet
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
     OR (NEW.email_confirmed_at IS NOT NULL 
         AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id)) THEN
    
    -- Insert profile (idempotent)
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert user credits (idempotent)
    INSERT INTO public.user_credits (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Sync to Resend (async, non-blocking)
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
$function$;

-- Repair existing users without profiles
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email 
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Repair existing users without credits
INSERT INTO public.user_credits (user_id)
SELECT u.id
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_credits uc WHERE uc.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;