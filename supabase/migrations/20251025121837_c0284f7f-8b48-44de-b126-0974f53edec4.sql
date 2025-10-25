-- Remove the trigger for updated_at on profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Remove the updated_at column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS updated_at;