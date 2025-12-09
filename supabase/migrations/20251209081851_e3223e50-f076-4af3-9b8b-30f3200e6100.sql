-- Step 1: Add new columns to strategy_phase_progress
ALTER TABLE public.strategy_phase_progress 
ADD COLUMN IF NOT EXISTS actions_completed INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS milestones_completed INTEGER[] DEFAULT '{}';

-- Step 2: Migrate existing action progress data
UPDATE public.strategy_phase_progress AS spp
SET actions_completed = (
  SELECT COALESCE(ARRAY_AGG(sap.action_index ORDER BY sap.action_index), '{}')
  FROM public.strategy_action_progress AS sap
  WHERE sap.strategy_id = spp.strategy_id 
    AND sap.phase_index = spp.phase_index
    AND sap.is_completed = true
);

-- Step 3: Migrate existing milestone progress data
UPDATE public.strategy_phase_progress AS spp
SET milestones_completed = (
  SELECT COALESCE(ARRAY_AGG(idx ORDER BY idx), '{}')
  FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY smp.created_at) - 1 AS idx, smp.is_completed
    FROM public.strategy_milestone_progress AS smp
    WHERE smp.strategy_id = spp.strategy_id 
      AND smp.phase_index = spp.phase_index
  ) AS numbered
  WHERE is_completed = true
);

-- Step 4: Drop the old tables (child tables no longer needed)
DROP TABLE IF EXISTS public.strategy_action_progress CASCADE;
DROP TABLE IF EXISTS public.strategy_milestone_progress CASCADE;