-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold', 'planning')),
  tags TEXT[],
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_teams junction table (many-to-many relationship)
CREATE TABLE public.project_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, team_id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Authenticated users can view all projects"
ON public.projects
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Project leaders can update their projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = leader_id);

CREATE POLICY "Project leaders can delete their projects"
ON public.projects
FOR DELETE
USING (auth.uid() = leader_id);

-- RLS Policies for project_teams
CREATE POLICY "Authenticated users can view all project teams"
ON public.project_teams
FOR SELECT
USING (true);

CREATE POLICY "Project leaders can assign teams"
ON public.project_teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_teams.project_id
    AND projects.leader_id = auth.uid()
  )
);

CREATE POLICY "Project leaders can remove teams"
ON public.project_teams
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_teams.project_id
    AND projects.leader_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_projects_leader_id ON public.projects(leader_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_teams_project_id ON public.project_teams(project_id);
CREATE INDEX idx_project_teams_team_id ON public.project_teams(team_id);