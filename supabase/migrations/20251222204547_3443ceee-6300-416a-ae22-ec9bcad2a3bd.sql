-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy allowing all authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Remove email column from profiles table (already stored in auth.users, not needed here)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;