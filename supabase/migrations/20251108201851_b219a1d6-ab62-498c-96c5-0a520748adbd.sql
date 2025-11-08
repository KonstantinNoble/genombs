-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule hourly cleanup job for deleted_accounts table
-- This removes entries older than 24 hours
SELECT cron.schedule(
  'cleanup-deleted-accounts-24h',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT public.cleanup_old_deleted_accounts();$$
);