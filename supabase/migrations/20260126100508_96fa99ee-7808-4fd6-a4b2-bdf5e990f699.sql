-- ============================================
-- B2B TEAM FEATURE - DATABASE SCHEMA
-- ============================================

-- 1. Create enum for team roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- 2. Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- 4. Create team_invitations table (with rate-limiting support)
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, email)
);

-- 5. Add team_id to existing tables (nullable, NULL = personal)
ALTER TABLE public.validation_analyses 
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.decision_records 
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.experiments 
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- 6. Create indexes for performance
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_validation_analyses_team_id ON public.validation_analyses(team_id);
CREATE INDEX idx_decision_records_team_id ON public.decision_records(team_id);
CREATE INDEX idx_experiments_team_id ON public.experiments(team_id);

-- 7. Create helper functions for RLS

-- Check if user is a member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Check if user is admin or owner of a team
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner', 'admin')
  )
$$;

-- Check if user is premium (for team creation)
CREATE OR REPLACE FUNCTION public.is_premium_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_premium FROM public.user_credits WHERE user_id = _user_id),
    false
  )
$$;

-- Check if user is owner of a team
CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role = 'owner'
  )
$$;

-- 8. Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for teams table

-- Only premium users can create teams
CREATE POLICY "Premium users can create teams" ON public.teams
FOR INSERT TO authenticated
WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = owner_id);

-- Team members can view their teams
CREATE POLICY "Team members can view teams" ON public.teams
FOR SELECT TO authenticated
USING (is_team_member(auth.uid(), id));

-- Only owner can update team
CREATE POLICY "Owner can update team" ON public.teams
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id);

-- Only owner can delete team
CREATE POLICY "Owner can delete team" ON public.teams
FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- 10. RLS Policies for team_members table

-- Team members can view other members
CREATE POLICY "Team members can view members" ON public.team_members
FOR SELECT TO authenticated
USING (is_team_member(auth.uid(), team_id));

-- Only admins/owners can add members (via invite acceptance handled by edge function)
CREATE POLICY "Admins can insert members" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (is_team_admin(auth.uid(), team_id) OR auth.uid() = user_id);

-- Only admins/owners can update member roles
CREATE POLICY "Admins can update members" ON public.team_members
FOR UPDATE TO authenticated
USING (is_team_admin(auth.uid(), team_id));

-- Admins can remove members, users can remove themselves
CREATE POLICY "Admins or self can delete members" ON public.team_members
FOR DELETE TO authenticated
USING (is_team_admin(auth.uid(), team_id) OR auth.uid() = user_id);

-- 11. RLS Policies for team_invitations table

-- Team admins can view invitations
CREATE POLICY "Admins can view invitations" ON public.team_invitations
FOR SELECT TO authenticated
USING (is_team_admin(auth.uid(), team_id));

-- Only admins/owners can create invitations
CREATE POLICY "Admins can create invitations" ON public.team_invitations
FOR INSERT TO authenticated
WITH CHECK (is_team_admin(auth.uid(), team_id));

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations" ON public.team_invitations
FOR DELETE TO authenticated
USING (is_team_admin(auth.uid(), team_id));

-- 12. Extended RLS for validation_analyses (add team visibility)
DROP POLICY IF EXISTS "Users can view own validation analyses" ON public.validation_analyses;
CREATE POLICY "Users can view own and team validations" ON public.validation_analyses
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
);

-- 13. Extended RLS for decision_records (add team visibility)
DROP POLICY IF EXISTS "Users can view own decision records" ON public.decision_records;
CREATE POLICY "Users can view own and team decisions" ON public.decision_records
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
);

-- 14. Extended RLS for experiments (add team visibility)
DROP POLICY IF EXISTS "Users can view their own experiments" ON public.experiments;
CREATE POLICY "Users can view own and team experiments" ON public.experiments
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
);

-- 15. Trigger for updated_at on teams table
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Function to get user's owned teams (for delete-account check)
CREATE OR REPLACE FUNCTION public.get_owned_teams(_user_id UUID)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name 
  FROM public.teams t
  INNER JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = _user_id AND tm.role = 'owner'
$$;

-- 17. Function to cleanup expired invitations (for scheduled job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.team_invitations
  WHERE expires_at < NOW();
END;
$$;