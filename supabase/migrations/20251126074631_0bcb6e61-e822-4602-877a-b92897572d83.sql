-- Change auto_renew default to NULL (unknown status)
ALTER TABLE public.user_credits 
ALTER COLUMN auto_renew SET DEFAULT NULL;

-- Update existing rows that have auto_renew = true but no Freemius subscription to NULL
-- (these were never synced with Freemius)
UPDATE public.user_credits
SET auto_renew = NULL
WHERE auto_renew = true 
  AND freemius_subscription_id IS NULL
  AND is_premium = false;