-- Fix trigger: Remove net.http_post call that causes verification failures
-- Resend sync will be handled by frontend fallback in Home.tsx
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- NOTE: Resend sync happens in frontend fallback (Home.tsx) after verification
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Repair existing confirmed users without profiles
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email 
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Repair existing confirmed users without credits
INSERT INTO public.user_credits (user_id)
SELECT u.id
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_credits uc WHERE uc.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;