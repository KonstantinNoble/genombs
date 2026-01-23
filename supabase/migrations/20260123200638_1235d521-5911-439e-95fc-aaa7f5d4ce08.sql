-- Add CASCADE foreign key as defense-in-depth for GDPR compliance
-- This ensures decision_records are deleted even if someone directly deletes auth.users

ALTER TABLE public.decision_records
ADD CONSTRAINT decision_records_user_id_auth_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;