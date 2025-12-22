-- Create function to get next comment time
CREATE OR REPLACE FUNCTION public.get_next_comment_time(p_user_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_comment_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT comment_count, comment_window_start 
  INTO v_comment_count, v_window_start
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no record, window expired, or limit not reached, return NULL (can comment now)
  IF v_window_start IS NULL OR (NOW() - v_window_start) > INTERVAL '10 hours' THEN
    RETURN NULL;
  END IF;
  
  IF COALESCE(v_comment_count, 0) < 1 THEN
    RETURN NULL;
  END IF;
  
  -- Return when the window expires
  RETURN v_window_start + INTERVAL '10 hours';
END;
$$;