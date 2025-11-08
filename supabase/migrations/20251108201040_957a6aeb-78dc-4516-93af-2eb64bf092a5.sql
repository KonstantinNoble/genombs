-- Add automatic cleanup for deleted_accounts table (24h retention)

-- Create a cron job to clean up old deleted_accounts entries every hour
-- This runs pg_cron which executes the cleanup_old_deleted_accounts function
SELECT cron.schedule(
  'cleanup-deleted-accounts-24h',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT public.cleanup_old_deleted_accounts();$$
);