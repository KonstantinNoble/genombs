-- Add premium status columns to user_credits table
ALTER TABLE public.user_credits
ADD COLUMN is_premium BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN premium_since TIMESTAMP WITH TIME ZONE,
ADD COLUMN freemius_subscription_id TEXT,
ADD COLUMN freemius_customer_id TEXT;

-- Create indices for better performance
CREATE INDEX idx_user_credits_premium ON public.user_credits(is_premium);
CREATE INDEX idx_user_credits_freemius_sub ON public.user_credits(freemius_subscription_id) WHERE freemius_subscription_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_credits.is_premium IS 'Indicates if user has active premium subscription';
COMMENT ON COLUMN public.user_credits.premium_since IS 'Timestamp when premium status was first activated';
COMMENT ON COLUMN public.user_credits.freemius_subscription_id IS 'Freemius subscription ID for tracking';
COMMENT ON COLUMN public.user_credits.freemius_customer_id IS 'Freemius customer ID for tracking';