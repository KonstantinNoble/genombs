
-- Add credit tracking columns to user_credits
ALTER TABLE public.user_credits
  ADD COLUMN daily_credits_limit INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN credits_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours');

-- Set existing premium users to 100 credits limit
UPDATE public.user_credits SET daily_credits_limit = 100 WHERE is_premium = true;

-- Trigger: sync credits limit when premium status changes
CREATE OR REPLACE FUNCTION public.sync_credits_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.is_premium = true AND OLD.is_premium = false THEN
    NEW.daily_credits_limit := 100;
  ELSIF NEW.is_premium = false AND OLD.is_premium = true THEN
    NEW.daily_credits_limit := 20;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_premium_change
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.sync_credits_limit();
