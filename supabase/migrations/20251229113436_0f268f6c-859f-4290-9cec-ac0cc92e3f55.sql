-- KRITISCH: Entferne die öffentliche SELECT-Policy, die alle Profile für jeden sichtbar macht
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;

-- Erstelle neue sichere Policy: Benutzer können nur ihr eigenes Profil sehen
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);