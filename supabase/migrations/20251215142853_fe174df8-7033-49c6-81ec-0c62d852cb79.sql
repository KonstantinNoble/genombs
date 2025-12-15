-- Fix corrupted daily_autopilot_generations values that exceed 3
UPDATE user_credits 
SET daily_autopilot_generations = 3 
WHERE daily_autopilot_generations > 3;