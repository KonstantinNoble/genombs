-- Remove the old cron job
SELECT cron.unschedule('cleanup-registration-attempts');

-- Create new cron job with differentiated logic for IP-Hash (2h) vs Email-Hash (24h)
SELECT cron.schedule(
  'cleanup-registration-attempts',
  '0 * * * *',
  $$
  -- Step 1: Set IP-Hash to NULL after 2 hours (Rate Limit Reset)
  UPDATE public.registration_attempts 
  SET ip_hash = NULL 
  WHERE ip_hash IS NOT NULL 
    AND attempted_at < NOW() - INTERVAL '2 hours';
  
  -- Step 2: Delete entire row after 24 hours (Email-Hash Cleanup)
  DELETE FROM public.registration_attempts 
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
  $$
);