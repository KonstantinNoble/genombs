-- Add subscription management columns to user_credits table
ALTER TABLE user_credits 
  ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS next_payment_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true;