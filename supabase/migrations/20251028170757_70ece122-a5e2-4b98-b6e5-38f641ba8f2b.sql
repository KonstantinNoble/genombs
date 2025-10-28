-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 3:00 AM UTC
-- This will automatically delete email hashes older than 30 days
SELECT cron.schedule(
  'cleanup-deleted-accounts-daily',
  '0 3 * * *',
  'SELECT public.cleanup_old_deleted_accounts();'
);