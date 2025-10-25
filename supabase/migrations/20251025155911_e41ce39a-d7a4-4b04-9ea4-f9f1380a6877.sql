-- Fix function search path security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;