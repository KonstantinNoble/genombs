-- Create table for stock analysis history
CREATE TABLE public.stock_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  risk_tolerance TEXT NOT NULL,
  time_horizon TEXT NOT NULL,
  age INTEGER,
  asset_class TEXT NOT NULL,
  market_events TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stock_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analysis history" 
ON public.stock_analysis_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis history" 
ON public.stock_analysis_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history" 
ON public.stock_analysis_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_stock_analysis_history_user_id ON public.stock_analysis_history(user_id, created_at DESC);