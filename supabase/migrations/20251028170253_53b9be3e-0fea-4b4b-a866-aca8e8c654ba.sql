-- First, clean up orphaned records (data from deleted users)

-- Delete orphaned business_ideas_history records
DELETE FROM public.business_ideas_history
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned business_tools_history records
DELETE FROM public.business_tools_history
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned user_credits records
DELETE FROM public.user_credits
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned profiles records
DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Add missing foreign keys with CASCADE DELETE (using IF NOT EXISTS logic)

DO $$ 
BEGIN
  -- business_ideas_history
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'business_ideas_history_user_id_fkey' 
    AND table_name = 'business_ideas_history'
  ) THEN
    ALTER TABLE public.business_ideas_history
    ADD CONSTRAINT business_ideas_history_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;

  -- business_tools_history
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'business_tools_history_user_id_fkey' 
    AND table_name = 'business_tools_history'
  ) THEN
    ALTER TABLE public.business_tools_history
    ADD CONSTRAINT business_tools_history_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;

  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;