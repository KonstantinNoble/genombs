-- Create deleted_accounts table for 30-day email hash blacklist (DSGVO-compliant)
CREATE TABLE public.deleted_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash TEXT UNIQUE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT DEFAULT 'user_requested'
);

-- Enable RLS (only service role has access)
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage deleted accounts"
  ON public.deleted_accounts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for fast hash lookups
CREATE INDEX idx_deleted_accounts_email_hash ON public.deleted_accounts(email_hash);
CREATE INDEX idx_deleted_accounts_deleted_at ON public.deleted_accounts(deleted_at);

-- Cleanup function: Automatically delete entries older than 30 days
-- Can be called manually or via external scheduler
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_accounts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.deleted_accounts
  WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;