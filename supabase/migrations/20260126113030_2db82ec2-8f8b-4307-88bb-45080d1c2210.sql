-- Change team_id foreign keys from SET NULL to CASCADE
-- This ensures all team data is deleted when a team is deleted

-- validation_analyses
ALTER TABLE validation_analyses 
  DROP CONSTRAINT IF EXISTS validation_analyses_team_id_fkey;
ALTER TABLE validation_analyses 
  ADD CONSTRAINT validation_analyses_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- experiments
ALTER TABLE experiments 
  DROP CONSTRAINT IF EXISTS experiments_team_id_fkey;
ALTER TABLE experiments 
  ADD CONSTRAINT experiments_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- decision_records
ALTER TABLE decision_records 
  DROP CONSTRAINT IF EXISTS decision_records_team_id_fkey;
ALTER TABLE decision_records 
  ADD CONSTRAINT decision_records_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;