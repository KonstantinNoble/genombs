-- Remove audit logs completely
-- Step 1: Drop trigger
DROP TRIGGER IF EXISTS trigger_cleanup_old_logs ON ai_request_logs;

-- Step 2: Drop functions
DROP FUNCTION IF EXISTS cleanup_old_logs_on_insert();
DROP FUNCTION IF EXISTS delete_old_ai_logs();

-- Step 3: Drop table (all data will be permanently deleted)
DROP TABLE IF EXISTS ai_request_logs;