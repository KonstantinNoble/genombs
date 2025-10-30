-- Create function to call Resend sync on new profile
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
      url := 'https://fdlyaasqywmdinyaivmw.supabase.co/functions/v1/sync-user-to-resend',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('email', NEW.email, 'user_id', NEW.id)::text::jsonb
    );
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table for new user registrations
CREATE TRIGGER on_profile_created_sync_resend
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_new_user_to_resend();