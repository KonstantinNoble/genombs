-- Create registration_attempts table for rate limiting
CREATE TABLE public.registration_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_hash TEXT
);

-- Index for fast queries by IP hash and time
CREATE INDEX idx_registration_attempts_ip_hash_time 
  ON public.registration_attempts(ip_hash, attempted_at);

-- Enable RLS - only service role can access
ALTER TABLE public.registration_attempts ENABLE ROW LEVEL SECURITY;

-- No public policies - only service_role can access via Edge Functions

-- Schedule cleanup cron job to remove entries older than 2 hours (runs every hour)
SELECT cron.schedule(
  'cleanup-registration-attempts',
  '0 * * * *',
  $$DELETE FROM public.registration_attempts WHERE attempted_at < NOW() - INTERVAL '2 hours'$$
);