-- Fix the existing user by creating their profile entry
INSERT INTO public.profiles (id, email)
SELECT id, email 
FROM auth.users 
WHERE id = '71d66e44-207a-4c73-930f-027ca2f71a12'
ON CONFLICT (id) DO NOTHING;