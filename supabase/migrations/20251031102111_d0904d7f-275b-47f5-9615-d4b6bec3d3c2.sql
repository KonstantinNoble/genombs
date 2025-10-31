-- Fix für Security Warning: Function Search Path Mutable
-- Die delete_old_ai_logs Funktion benötigt einen festen search_path

DROP FUNCTION IF EXISTS delete_old_ai_logs();

CREATE OR REPLACE FUNCTION delete_old_ai_logs()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM ai_request_logs
  WHERE created_at < now() - interval '2 years';
END;
$$;

COMMENT ON FUNCTION delete_old_ai_logs() IS 'Automatically deletes AI request logs older than 2 years to comply with GDPR data minimization principles. Function has secure search_path set to prevent SQL injection.';