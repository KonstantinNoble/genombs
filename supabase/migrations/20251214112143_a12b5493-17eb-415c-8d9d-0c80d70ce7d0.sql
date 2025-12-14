-- Add global daily autopilot generation limit columns
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS daily_autopilot_generations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS autopilot_generation_reset_date DATE;