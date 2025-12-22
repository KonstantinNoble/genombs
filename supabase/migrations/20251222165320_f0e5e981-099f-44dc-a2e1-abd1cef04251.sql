-- Update function to check comment limit (1 per 10 hours)
CREATE OR REPLACE FUNCTION public.check_comment_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_comment_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_exists BOOLEAN;
BEGIN
  -- Ensure a row exists for this user
  SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
  IF NOT v_exists THEN
    INSERT INTO public.user_credits (user_id, comment_count, comment_window_start)
    VALUES (p_user_id, 1, NOW());
    RETURN TRUE;
  END IF;

  -- Get current comment data
  SELECT comment_count, comment_window_start 
  INTO v_comment_count, v_window_start
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no window start or window expired (more than 10 hours), reset counter
  IF v_window_start IS NULL OR (NOW() - v_window_start) > INTERVAL '10 hours' THEN
    UPDATE public.user_credits
    SET 
      comment_count = 1,
      comment_window_start = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Check if user has reached limit (1 comment per 10 hours)
  IF v_comment_count < 1 THEN
    UPDATE public.user_credits
    SET 
      comment_count = comment_count + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Update function to get remaining comments
CREATE OR REPLACE FUNCTION public.get_remaining_comments(p_user_id uuid)
RETURNS integer
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
  
  -- If no record or window expired, return full limit
  IF v_window_start IS NULL OR (NOW() - v_window_start) > INTERVAL '10 hours' THEN
    RETURN 1;
  END IF;
  
  RETURN GREATEST(0, 1 - COALESCE(v_comment_count, 0));
END;
$$;