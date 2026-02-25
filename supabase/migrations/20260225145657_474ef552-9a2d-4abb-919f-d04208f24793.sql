CREATE OR REPLACE FUNCTION public.get_auth_user_by_email(lookup_email text)
RETURNS TABLE(id uuid, email text, raw_app_meta_data jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, email::text, raw_app_meta_data
  FROM auth.users
  WHERE email = lower(lookup_email)
  LIMIT 1;
$$;