-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Project leaders can update tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Leaders, assignees, or self can add to tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Leaders, assignees, or self can remove from tasks" ON public.task_assignees;

-- Create new permissive policies for tasks
CREATE POLICY "Authenticated users can update any task"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create new permissive policies for task_assignees
CREATE POLICY "Authenticated users can add assignees to any task"
ON public.task_assignees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can remove assignees from any task"
ON public.task_assignees
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);