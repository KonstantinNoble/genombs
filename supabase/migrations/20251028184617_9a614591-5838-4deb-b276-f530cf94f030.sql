-- Update check_and_update_analysis_limit to allow 2 analyses per 24 hours instead of 1
-- Add a counter column to track analyses within the 24-hour window
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_window_start TIMESTAMP WITH TIME ZONE;

-- Update the function to track 2 analyses per 24-hour window
CREATE OR REPLACE FUNCTION public.check_and_update_analysis_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_analysis TIMESTAMP WITH TIME ZONE;
  v_analysis_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_exists boolean;
BEGIN
  -- Ensure a row exists for this user; if not, create it and allow analysis now
  SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
  IF NOT v_exists THEN
    INSERT INTO public.user_credits (user_id, last_analysis_at, analysis_count, analysis_window_start)
    VALUES (p_user_id, NOW(), 1, NOW());
    RETURN TRUE;
  END IF;

  -- Get current analysis data
  SELECT last_analysis_at, analysis_count, analysis_window_start 
  INTO v_last_analysis, v_analysis_count, v_window_start
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no window start or window expired (more than 24 hours), reset counter
  IF v_window_start IS NULL OR (NOW() - v_window_start) > INTERVAL '24 hours' THEN
    UPDATE public.user_credits
    SET 
      last_analysis_at = NOW(), 
      analysis_count = 1,
      analysis_window_start = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Check if user has reached limit (2 analyses per 24 hours)
  IF v_analysis_count < 2 THEN
    -- Increment counter
    UPDATE public.user_credits
    SET 
      last_analysis_at = NOW(), 
      analysis_count = analysis_count + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  ELSE
    -- Limit reached
    RETURN FALSE;
  END IF;
END;
$$;