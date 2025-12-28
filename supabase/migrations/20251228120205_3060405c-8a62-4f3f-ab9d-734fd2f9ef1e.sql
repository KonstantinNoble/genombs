-- Funktion: Deaktiviere abgelaufene Abos
CREATE OR REPLACE FUNCTION public.deactivate_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_credits
  SET 
    is_premium = false,
    auto_renew = false,
    updated_at = NOW()
  WHERE 
    is_premium = true
    AND subscription_end_date IS NOT NULL
    AND subscription_end_date < NOW()
    AND auto_renew = false;
END;
$$;