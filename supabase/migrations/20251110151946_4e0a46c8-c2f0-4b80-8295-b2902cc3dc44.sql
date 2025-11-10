-- Create pending_premium table for users who purchase before registering
CREATE TABLE IF NOT EXISTS public.pending_premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freemius_customer_id text NOT NULL,
  freemius_subscription_id text NOT NULL,
  email text NOT NULL,
  is_premium boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_premium ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role can manage pending premium" 
ON public.pending_premium 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_premium_email ON public.pending_premium(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_pending_premium_customer ON public.pending_premium(freemius_customer_id);