-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs every hour to check for expired premium subscriptions
-- This ensures users lose premium access automatically when their subscription expires
SELECT cron.schedule(
  'expire-premium-subscriptions',
  '0 * * * *', -- Run every hour at minute 0
  $$
  UPDATE public.user_credits
  SET 
    is_premium = false,
    auto_renew = false,
    updated_at = NOW()
  WHERE 
    is_premium = true 
    AND subscription_end_date IS NOT NULL 
    AND subscription_end_date < NOW();
  $$
);