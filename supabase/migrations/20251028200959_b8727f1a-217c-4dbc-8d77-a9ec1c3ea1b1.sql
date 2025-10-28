-- Add separate counters for tools and ideas
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS tools_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ideas_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tools_window_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ideas_window_start TIMESTAMP WITH TIME ZONE;

-- Update the function to handle separate limits
CREATE OR REPLACE FUNCTION public.check_and_update_analysis_limit(
  p_user_id uuid,
  p_analysis_type text DEFAULT 'general'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_exists boolean;
BEGIN
  -- Ensure a row exists for this user
  SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
  IF NOT v_exists THEN
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id);
  END IF;

  -- Get current data based on analysis type
  IF p_analysis_type = 'tools' THEN
    SELECT tools_count, tools_window_start 
    INTO v_count, v_window_start
    FROM public.user_credits
    WHERE user_id = p_user_id;
  ELSIF p_analysis_type = 'ideas' THEN
    SELECT ideas_count, ideas_window_start 
    INTO v_count, v_window_start
    FROM public.user_credits
    WHERE user_id = p_user_id;
  ELSE
    -- Fallback to old behavior
    SELECT analysis_count, analysis_window_start 
    INTO v_count, v_window_start
    FROM public.user_credits
    WHERE user_id = p_user_id;
  END IF;
  
  -- If no window start or window expired (more than 24 hours), reset counter
  IF v_window_start IS NULL OR (NOW() - v_window_start) > INTERVAL '24 hours' THEN
    IF p_analysis_type = 'tools' THEN
      UPDATE public.user_credits
      SET tools_count = 1, tools_window_start = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF p_analysis_type = 'ideas' THEN
      UPDATE public.user_credits
      SET ideas_count = 1, ideas_window_start = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      UPDATE public.user_credits
      SET analysis_count = 1, analysis_window_start = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
    RETURN TRUE;
  END IF;
  
  -- Check if user has reached limit (2 analyses per 24 hours per type)
  IF v_count < 2 THEN
    IF p_analysis_type = 'tools' THEN
      UPDATE public.user_credits
      SET tools_count = tools_count + 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF p_analysis_type = 'ideas' THEN
      UPDATE public.user_credits
      SET ideas_count = ideas_count + 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      UPDATE public.user_credits
      SET analysis_count = analysis_count + 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;