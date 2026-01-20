-- Add new column for dynamic model responses storage
ALTER TABLE public.validation_analyses 
ADD COLUMN IF NOT EXISTS model_responses JSONB DEFAULT NULL;

-- Add column to store the selected models
ALTER TABLE public.validation_analyses 
ADD COLUMN IF NOT EXISTS selected_models TEXT[] DEFAULT NULL;

-- Add column to store model weights
ALTER TABLE public.validation_analyses 
ADD COLUMN IF NOT EXISTS model_weights JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.validation_analyses.model_responses IS 'Dynamic storage for all model responses as JSON object with model keys';
COMMENT ON COLUMN public.validation_analyses.selected_models IS 'Array of selected model keys used in this validation';
COMMENT ON COLUMN public.validation_analyses.model_weights IS 'User-configured weights for each model as JSON object';