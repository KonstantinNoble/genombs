-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create new policy that allows everyone (including anonymous users) to view profiles
CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
USING (true);