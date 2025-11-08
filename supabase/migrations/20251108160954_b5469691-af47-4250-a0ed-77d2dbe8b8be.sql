-- Create whop_memberships table to store Whop subscription data
CREATE TABLE public.whop_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  whop_user_id text,
  whop_membership_id text UNIQUE NOT NULL,
  status text CHECK (status IN ('active', 'cancelled', 'expired', 'paused')) NOT NULL DEFAULT 'active',
  plan_id text NOT NULL,
  valid_until timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.whop_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.whop_memberships
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all memberships (for webhook)
CREATE POLICY "Service role can manage all memberships"
ON public.whop_memberships
FOR ALL
USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_whop_memberships_updated_at
BEFORE UPDATE ON public.whop_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add premium fields to user_credits table
ALTER TABLE public.user_credits
ADD COLUMN is_premium boolean DEFAULT false,
ADD COLUMN premium_source text CHECK (premium_source IN ('whop', 'lifetime', 'trial'));

-- Create index for faster whop_user_id lookups
CREATE INDEX idx_whop_memberships_user_id ON public.whop_memberships(user_id);
CREATE INDEX idx_whop_memberships_whop_user_id ON public.whop_memberships(whop_user_id);
CREATE INDEX idx_user_credits_premium ON public.user_credits(user_id, is_premium);