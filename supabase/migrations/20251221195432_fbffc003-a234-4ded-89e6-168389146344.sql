-- Add column to track the last idea post timestamp (independent of actual posts)
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS last_idea_post_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update the check function to use the new timestamp-based approach (1 post per 24h)
CREATE OR REPLACE FUNCTION public.check_idea_post_limit(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_post_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the last post timestamp
  SELECT last_idea_post_at INTO v_last_post_at
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no record exists or never posted, allow
  IF v_last_post_at IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if 24 hours have passed since last post
  IF (NOW() - v_last_post_at) > INTERVAL '24 hours' THEN
    RETURN TRUE;
  END IF;
  
  -- Limit reached
  RETURN FALSE;
END;
$function$;

-- Update the remaining posts function to return 0 or 1 based on time
CREATE OR REPLACE FUNCTION public.get_remaining_idea_posts(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_post_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the last post timestamp
  SELECT last_idea_post_at INTO v_last_post_at
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no record exists or never posted, return 1
  IF v_last_post_at IS NULL THEN
    RETURN 1;
  END IF;
  
  -- Check if 24 hours have passed since last post
  IF (NOW() - v_last_post_at) > INTERVAL '24 hours' THEN
    RETURN 1;
  END IF;
  
  -- Limit reached
  RETURN 0;
END;
$function$;

-- Create function to get the next available post time
CREATE OR REPLACE FUNCTION public.get_next_idea_post_time(p_user_id uuid)
 RETURNS TIMESTAMP WITH TIME ZONE
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_post_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_idea_post_at INTO v_last_post_at
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF v_last_post_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_last_post_at + INTERVAL '24 hours';
END;
$function$;

-- Create function to record a post attempt (called when posting)
CREATE OR REPLACE FUNCTION public.record_idea_post(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_credits
  SET last_idea_post_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$function$;