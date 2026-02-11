CREATE POLICY "Users can delete own profiles"
  ON public.website_profiles FOR DELETE
  USING (auth.uid() = user_id);