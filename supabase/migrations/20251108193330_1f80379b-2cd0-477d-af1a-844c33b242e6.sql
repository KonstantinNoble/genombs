-- Remove Whop integration from database

-- 1. Drop whop_memberships table completely
DROP TABLE IF EXISTS public.whop_memberships CASCADE;

-- 2. Remove premium-related columns from user_credits
ALTER TABLE public.user_credits 
DROP COLUMN IF EXISTS is_premium,
DROP COLUMN IF EXISTS premium_source;