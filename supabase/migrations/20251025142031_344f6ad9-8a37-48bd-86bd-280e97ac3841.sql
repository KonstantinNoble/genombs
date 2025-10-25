-- Create user credits table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to initialize credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, last_reset_date)
  VALUES (new.id, 100, CURRENT_DATE);
  RETURN new;
END;
$$;

-- Create trigger to initialize credits on user signup
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Add trigger for updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to reset credits daily
CREATE OR REPLACE FUNCTION public.reset_daily_credits(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_credits
  SET credits = 100,
      last_reset_date = CURRENT_DATE
  WHERE user_id = p_user_id
    AND last_reset_date < CURRENT_DATE;
END;
$$;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- First reset credits if needed
  PERFORM public.reset_daily_credits(p_user_id);
  
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if enough credits
  IF v_current_credits >= p_amount THEN
    -- Deduct credits
    UPDATE public.user_credits
    SET credits = credits - p_amount
    WHERE user_id = p_user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;