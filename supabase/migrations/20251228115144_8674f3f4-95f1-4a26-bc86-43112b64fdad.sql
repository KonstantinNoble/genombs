-- Fix the trigger function to match current profiles table schema
-- The profiles table only has: id, created_at (email column was removed)

CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Trigger fires when email is confirmed OR if confirmed user has no profile yet
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
     OR (NEW.email_confirmed_at IS NOT NULL 
         AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id)) THEN
    
    -- Insert profile (idempotent) - only id and created_at columns exist
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert user credits (idempotent)
    INSERT INTO public.user_credits (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;