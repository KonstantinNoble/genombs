
-- Table: customer_maps
CREATE TABLE public.customer_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text,
  product_summary text,
  icp_data jsonb,
  communities jsonb,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer maps" ON public.customer_maps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customer maps" ON public.customer_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customer maps" ON public.customer_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customer maps" ON public.customer_maps FOR DELETE USING (auth.uid() = user_id);

-- Table: generated_posts
CREATE TABLE public.generated_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text,
  tone text,
  goal text,
  content text,
  audience_context jsonb,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated posts" ON public.generated_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generated posts" ON public.generated_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generated posts" ON public.generated_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generated posts" ON public.generated_posts FOR DELETE USING (auth.uid() = user_id);

-- Table: feature_usage (daily limit tracking)
CREATE TABLE public.feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  used_today integer NOT NULL DEFAULT 0,
  reset_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE (user_id, feature)
);

ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feature usage" ON public.feature_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feature usage" ON public.feature_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feature usage" ON public.feature_usage FOR UPDATE USING (auth.uid() = user_id);
