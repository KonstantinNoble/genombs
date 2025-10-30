-- Remove the trigger that was blocking user registration
DROP TRIGGER IF EXISTS on_profile_created_sync_resend ON public.profiles;

-- Remove the function that called the edge function via net.http_post
DROP FUNCTION IF EXISTS public.sync_new_user_to_resend();