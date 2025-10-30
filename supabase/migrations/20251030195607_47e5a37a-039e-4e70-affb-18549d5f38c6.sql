-- Funktion zum automatischen Löschen unbestätigter Accounts nach 7 Tagen
CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Lösche unbestätigte User aus auth.users, die älter als 7 Tage sind
  -- Dies triggert automatisch CASCADE DELETE für profiles und user_credits
  DELETE FROM auth.users
  WHERE email_confirmed_at IS NULL
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Kommentar hinzufügen
COMMENT ON FUNCTION public.cleanup_unconfirmed_users() IS 'Löscht unbestätigte Benutzerkonten, die älter als 7 Tage sind';