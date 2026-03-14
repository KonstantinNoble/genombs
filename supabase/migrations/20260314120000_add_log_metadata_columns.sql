-- Add optional metadata columns to gateway_request_logs for enhanced logging
-- These columns are optional and the system will work without them

-- Add prompt_optimized column (tracks if prompt was enhanced by optimizer)
ALTER TABLE public.gateway_request_logs 
ADD COLUMN IF NOT EXISTS prompt_optimized boolean DEFAULT false;

-- Add fallback_used column (tracks if a fallback provider was used)
ALTER TABLE public.gateway_request_logs 
ADD COLUMN IF NOT EXISTS fallback_used boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.gateway_request_logs.prompt_optimized IS 'Whether the prompt was enhanced by the Groq optimizer before sending to the provider';
COMMENT ON COLUMN public.gateway_request_logs.fallback_used IS 'Whether a fallback provider was used due to primary provider failure';
