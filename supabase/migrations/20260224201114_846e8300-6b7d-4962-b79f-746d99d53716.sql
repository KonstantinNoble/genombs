
CREATE OR REPLACE FUNCTION public.sync_credits_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_premium = true AND OLD.is_premium = false THEN
    NEW.daily_credits_limit := 100;
    NEW.credits_used := 0;
    NEW.credits_reset_at := now() + interval '24 hours';
  ELSIF NEW.is_premium = false AND OLD.is_premium = true THEN
    NEW.daily_credits_limit := 20;
    NEW.credits_used := 0;
    NEW.credits_reset_at := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$function$;
