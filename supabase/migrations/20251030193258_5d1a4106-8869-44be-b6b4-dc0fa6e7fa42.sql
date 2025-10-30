-- Recreate the trigger with correct WHEN clause to ensure it fires for all email confirmations
DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;

CREATE TRIGGER on_user_email_confirmed
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_user_email_confirmed();

-- Backfill: Create missing profiles for users with confirmed emails
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

-- Backfill: Create missing user credits for users with confirmed emails
INSERT INTO public.user_credits (user_id)
SELECT id FROM auth.users
WHERE email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_credits WHERE user_credits.user_id = auth.users.id)
ON CONFLICT (user_id) DO NOTHING;