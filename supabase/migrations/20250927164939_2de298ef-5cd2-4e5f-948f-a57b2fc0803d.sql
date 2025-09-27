-- ========================================
-- RESET: Sistema de Autenticação Limpo
-- ========================================

-- Remover todas as tabelas existentes (exceto auth que é gerenciada pelo Supabase)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.project_teams CASCADE;
DROP TABLE IF EXISTS public.task_assignees CASCADE;
DROP TABLE IF EXISTS public.task_teams CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover tipos customizados
DROP TYPE IF EXISTS public.activity_type CASCADE;
DROP TYPE IF EXISTS public.invitation_status CASCADE;
DROP TYPE IF EXISTS public.project_status CASCADE;
DROP TYPE IF EXISTS public.project_priority CASCADE;
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.can_access_project CASCADE;
DROP FUNCTION IF EXISTS public.sync_task_progress_status CASCADE;
DROP FUNCTION IF EXISTS public.log_activity CASCADE;
DROP FUNCTION IF EXISTS public.generate_invitation_token CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_invitations CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.is_team_member CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- ========================================
-- CRIAR SISTEMA DE AUTENTICAÇÃO ESSENCIAL
-- ========================================

-- 1. Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('member', 'admin', 'moderator');

-- 2. Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  role public.app_role NOT NULL DEFAULT 'member',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_role_idx ON public.profiles(role);

-- 4. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar policies de RLS para profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 6. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 7. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Função para criar perfil automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    display_name,
    phone,
    company,
    role,
    email_verified,
    metadata
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'member'),
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data->'preferences', '{}'::jsonb)
  );
  RETURN NEW;
END;
$$;

-- 9. Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 10. Função utilitária para verificar roles (para uso futuro)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role >= _role
  )
$$;

-- ========================================
-- DADOS DE TESTE (OPCIONAL)
-- ========================================

-- Inserir um usuário de teste no auth.users seria feito pelo Supabase Auth
-- Os perfis serão criados automaticamente pelo trigger

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- Verificar se as policies estão ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';