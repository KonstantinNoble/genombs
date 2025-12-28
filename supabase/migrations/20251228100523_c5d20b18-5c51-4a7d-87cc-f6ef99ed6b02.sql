-- Drop display_name column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name;