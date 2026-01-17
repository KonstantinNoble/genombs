-- Add ON DELETE CASCADE to validation_analyses
ALTER TABLE public.validation_analyses
ADD CONSTRAINT validation_analyses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to experiments
ALTER TABLE public.experiments
ADD CONSTRAINT experiments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;