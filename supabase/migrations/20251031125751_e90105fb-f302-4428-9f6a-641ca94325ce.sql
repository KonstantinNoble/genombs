-- Create function for automatic cleanup (triggered on INSERT)
CREATE OR REPLACE FUNCTION cleanup_old_logs_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all logs older than 2 years
  DELETE FROM ai_request_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger: Executed after every INSERT in ai_request_logs
CREATE TRIGGER trigger_cleanup_old_logs
  AFTER INSERT ON ai_request_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_logs_on_insert();

-- Documentation comment
COMMENT ON FUNCTION cleanup_old_logs_on_insert() IS 
  'Automatically deletes AI request logs older than 2 years. Triggered on every INSERT to ai_request_logs table. GDPR compliance: Art. 17 (Right to erasure), 2-year retention period.';