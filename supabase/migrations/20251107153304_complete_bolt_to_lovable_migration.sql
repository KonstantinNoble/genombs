/*
  # Complete Migration from Bolt to Lovable Database

  1. Changes
    - Update ALL database functions to use Lovable Supabase URL
    - Replace ALL Bolt URLs (fdlyaasqywmdinyaivmw) with Lovable (cywblvdydcmyfdbofmix)
    - Update ALL API keys to use Lovable credentials
    - Fix all triggers and functions
  
  2. Functions Updated
    - handle_user_email_confirmed: Main user creation trigger
    - sync_new_user_to_resend: Resend sync function
  
  3. Security
    - Maintains existing RLS policies
    - No data loss
    - All functions remain SECURITY DEFINER
*/

-- Update main user creation function with Lovable credentials
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text := 'https://cywblvdydcmyfdbofmix.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d2JsdmR5ZGNteWZkYm9mbWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjIxNDIsImV4cCI6MjA3ODA5ODE0Mn0.aSHKaYmLDljUwmK-Z2ZvkK14S1HiyykRbizS4vKDHH4';
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

-- Update Resend sync function with Lovable URL
CREATE OR REPLACE FUNCTION public.sync_new_user_to_resend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call Edge Function to sync user to Resend
  PERFORM
    net.http_post(
      url := 'https://cywblvdydcmyfdbofmix.supabase.co/functions/v1/sync-user-to-resend',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('email', NEW.email, 'user_id', NEW.id)::text::jsonb
    );
  RETURN NEW;
END;
$$;