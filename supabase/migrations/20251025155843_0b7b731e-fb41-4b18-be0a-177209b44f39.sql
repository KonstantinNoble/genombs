-- Remove credit system and add daily analysis limit
ALTER TABLE public.user_credits 
DROP COLUMN IF EXISTS credits,
ADD COLUMN last_analysis_at TIMESTAMP WITH TIME ZONE;

-- Drop old credit-related functions
DROP FUNCTION IF EXISTS public.deduct_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.reset_daily_credits(UUID);

-- Create function to check and update daily analysis limit
CREATE OR REPLACE FUNCTION public.check_and_update_analysis_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_analysis TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get last analysis time
  SELECT last_analysis_at INTO v_last_analysis
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user can analyze (no analysis yet OR more than 24 hours passed)
  IF v_last_analysis IS NULL OR (NOW() - v_last_analysis) > INTERVAL '24 hours' THEN
    -- Update last analysis time
    UPDATE public.user_credits
    SET last_analysis_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for user_credits table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credits;