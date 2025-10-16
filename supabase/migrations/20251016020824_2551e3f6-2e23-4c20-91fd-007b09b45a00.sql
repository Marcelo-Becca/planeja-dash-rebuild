-- Add team_id column to tasks table
ALTER TABLE public.tasks ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_tasks_team_id ON public.tasks(team_id);