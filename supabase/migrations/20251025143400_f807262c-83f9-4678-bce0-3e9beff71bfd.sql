-- Insert missing credits for existing users
INSERT INTO public.user_credits (user_id, credits, last_reset_date)
SELECT id, 100, CURRENT_DATE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- Add INSERT RLS policy for user_credits
CREATE POLICY "Users can insert their own credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);