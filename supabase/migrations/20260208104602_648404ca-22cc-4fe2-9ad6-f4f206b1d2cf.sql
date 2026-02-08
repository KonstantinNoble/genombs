
-- Clean up remaining orphaned function that references dropped table
DROP FUNCTION IF EXISTS public.log_decision_action(uuid, text, jsonb);
