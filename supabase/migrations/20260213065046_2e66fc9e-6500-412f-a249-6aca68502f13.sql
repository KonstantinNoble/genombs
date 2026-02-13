-- Create analysis_queue table
CREATE TABLE public.analysis_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  url text NOT NULL,
  model text NOT NULL DEFAULT 'gemini-flash',
  is_own_website boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  profile_id uuid,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.analysis_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view and create their own queue entries
CREATE POLICY "Users can create own queue entries" 
ON public.analysis_queue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own queue entries" 
ON public.analysis_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can update queue entries" 
ON public.analysis_queue 
FOR UPDATE 
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Service role can select all queue entries" 
ON public.analysis_queue 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- Index for efficient queue processing
CREATE INDEX idx_analysis_queue_status_priority 
ON public.analysis_queue(status, priority DESC, created_at ASC);

CREATE INDEX idx_analysis_queue_user 
ON public.analysis_queue(user_id);

-- Function to handle priority for premium users (will be called when inserting)
CREATE OR REPLACE FUNCTION public.set_queue_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Premium users get priority 100, others get 0
  IF (SELECT is_premium FROM public.user_credits WHERE user_id = NEW.user_id) THEN
    NEW.priority := 100;
  ELSE
    NEW.priority := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to set priority
CREATE TRIGGER set_queue_priority_trigger
BEFORE INSERT ON public.analysis_queue
FOR EACH ROW
EXECUTE FUNCTION public.set_queue_priority();