-- Drop tables in correct order (child tables first, then parent tables)

-- 1. Drop autopilot_focus_tasks (references active_strategies)
DROP TABLE IF EXISTS public.autopilot_focus_tasks CASCADE;

-- 2. Drop strategy_phase_progress (references active_strategies)
DROP TABLE IF EXISTS public.strategy_phase_progress CASCADE;

-- 3. Drop active_strategies
DROP TABLE IF EXISTS public.active_strategies CASCADE;

-- 4. Drop market_research_history
DROP TABLE IF EXISTS public.market_research_history CASCADE;