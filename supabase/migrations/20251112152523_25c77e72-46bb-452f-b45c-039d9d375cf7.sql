-- Create table for processed webhook events to prevent replay attacks
CREATE TABLE public.processed_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for efficient cleanup of old events
CREATE INDEX idx_processed_events_date ON public.processed_webhook_events(processed_at);

-- Enable RLS
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage processed events
CREATE POLICY "Service role can manage processed events"
ON public.processed_webhook_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to cleanup old processed events (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_processed_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$;