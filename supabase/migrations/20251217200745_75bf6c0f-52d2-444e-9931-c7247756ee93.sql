-- Erweitere pending_premium Tabelle um fehlende Subscription-Felder
ALTER TABLE public.pending_premium 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_cycle INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;