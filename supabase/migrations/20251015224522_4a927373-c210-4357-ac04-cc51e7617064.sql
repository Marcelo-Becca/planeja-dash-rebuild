-- Remove a política antiga que só permite ver o próprio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Cria nova política permitindo que usuários autenticados vejam todos os perfis
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);