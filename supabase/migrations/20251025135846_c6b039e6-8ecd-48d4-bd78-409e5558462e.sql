-- Add wealth_class column to stock_analysis_history table
ALTER TABLE public.stock_analysis_history 
ADD COLUMN wealth_class TEXT;