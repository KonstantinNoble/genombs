-- Make the daily-limit function robust when user_credits row doesn't exist
CREATE OR REPLACE FUNCTION public.check_and_update_analysis_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_analysis TIMESTAMP WITH TIME ZONE;
  v_exists boolean;
BEGIN
  -- Ensure a row exists for this user; if not, create it and allow analysis now
  SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
  IF NOT v_exists THEN
    INSERT INTO public.user_credits (user_id, last_analysis_at)
    VALUES (p_user_id, NOW());
    RETURN TRUE;
  END IF;

  -- Get last analysis time
  SELECT last_analysis_at INTO v_last_analysis
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user can analyze (no analysis yet OR more than 24 hours passed)
  IF v_last_analysis IS NULL OR (NOW() - v_last_analysis) > INTERVAL '24 hours' THEN
    -- Update last analysis time
    UPDATE public.user_credits
    SET last_analysis_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;