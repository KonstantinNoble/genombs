-- 1. Verwaiste Einträge bereinigen (falls bereits vorhanden)
DELETE FROM strategy_phase_progress 
WHERE strategy_id NOT IN (SELECT id FROM active_strategies);

-- 2. Foreign Key mit CASCADE DELETE hinzufügen
ALTER TABLE strategy_phase_progress
ADD CONSTRAINT fk_strategy_phase_progress_strategy
FOREIGN KEY (strategy_id) REFERENCES active_strategies(id)
ON DELETE CASCADE;