-- ============================================
-- Phase 2a: Admin-Log-Tabelle für unveränderliche Beweissicherung
-- ============================================

-- Neue Tabelle für AI Request Logs (nur Admin-Zugriff)
CREATE TABLE IF NOT EXISTS ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL CHECK (function_name IN ('business-tools-advisor', 'business-ideas-advisor')),
  request_payload JSONB NOT NULL,
  response_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;

-- Policy: NUR Service Role kann lesen/schreiben (Nutzer haben KEINEN Zugriff)
CREATE POLICY "Service role only access" ON ai_request_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_created ON ai_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_function ON ai_request_logs(function_name, created_at DESC);

-- Funktion für automatische Löschung nach 2 Jahren (DSGVO-Compliance)
CREATE OR REPLACE FUNCTION delete_old_ai_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_request_logs
  WHERE created_at < now() - interval '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentar für Dokumentation
COMMENT ON TABLE ai_request_logs IS 'Admin-only audit logs for AI requests. Retained for 2 years for legal compliance and quality assurance. Users cannot access, modify, or delete these records.';
COMMENT ON FUNCTION delete_old_ai_logs() IS 'Automatically deletes AI request logs older than 2 years to comply with GDPR data minimization principles.';