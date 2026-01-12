-- Add column to track last password reset request for rate limiting
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS last_password_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;