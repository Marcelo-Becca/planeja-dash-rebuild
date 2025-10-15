-- Criar tabela de equipes
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  main_objective text,
  leader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de membros da equipe (relacionamento many-to-many)
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para teams
CREATE POLICY "Authenticated users can view all teams"
ON public.teams
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can update their teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (auth.uid() = leader_id);

CREATE POLICY "Team leaders can delete their teams"
ON public.teams
FOR DELETE
TO authenticated
USING (auth.uid() = leader_id);

-- Políticas RLS para team_members
CREATE POLICY "Authenticated users can view all team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Team leaders can add members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = team_id AND leader_id = auth.uid()
  )
);

CREATE POLICY "Team leaders can remove members"
ON public.team_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = team_id AND leader_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;