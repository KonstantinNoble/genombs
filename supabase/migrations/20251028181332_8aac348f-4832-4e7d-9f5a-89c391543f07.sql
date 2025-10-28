-- Update cleanup function to delete hashes older than 24 hours instead of 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.deleted_accounts
  WHERE deleted_at < NOW() - INTERVAL '24 hours';
END;
$function$;

-- Delete old daily cron job
SELECT cron.unschedule('cleanup-deleted-accounts-daily');

-- Schedule hourly cleanup instead of daily (runs every hour at minute 0)
SELECT cron.schedule(
  'cleanup-deleted-accounts-hourly',
  '0 * * * *',
  'SELECT public.cleanup_old_deleted_accounts();'
);