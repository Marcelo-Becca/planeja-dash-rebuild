-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_assignees table for many-to-many relationship
CREATE TABLE public.task_assignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Authenticated users can view all tasks"
  ON public.tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Project leaders can update tasks in their projects"
  ON public.tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.leader_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.task_assignees
      WHERE task_assignees.task_id = tasks.id
      AND task_assignees.user_id = auth.uid()
    )
  );

CREATE POLICY "Project leaders can delete tasks in their projects"
  ON public.tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.leader_id = auth.uid()
    )
  );

-- RLS Policies for task_assignees
CREATE POLICY "Authenticated users can view all task assignees"
  ON public.task_assignees
  FOR SELECT
  USING (true);

CREATE POLICY "Project leaders can assign users to tasks"
  ON public.task_assignees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON tasks.project_id = projects.id
      WHERE tasks.id = task_assignees.task_id
      AND projects.leader_id = auth.uid()
    )
  );

CREATE POLICY "Project leaders can remove assignees from tasks"
  ON public.task_assignees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON tasks.project_id = projects.id
      WHERE tasks.id = task_assignees.task_id
      AND projects.leader_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_task_assignees_task_id ON public.task_assignees(task_id);
CREATE INDEX idx_task_assignees_user_id ON public.task_assignees(user_id);