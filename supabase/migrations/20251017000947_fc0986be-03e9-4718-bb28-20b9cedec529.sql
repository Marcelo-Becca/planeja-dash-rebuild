-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Project leaders can assign users to tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Project leaders can remove assignees from tasks" ON public.task_assignees;

-- Create more flexible policies
-- Allow project leaders OR existing task assignees to add new assignees
CREATE POLICY "Project leaders and assignees can add users to tasks"
ON public.task_assignees
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = task_assignees.task_id
    AND projects.leader_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM task_assignees AS existing_assignees
    WHERE existing_assignees.task_id = task_assignees.task_id
    AND existing_assignees.user_id = auth.uid()
  )
);

-- Allow project leaders OR existing task assignees to remove assignees
CREATE POLICY "Project leaders and assignees can remove users from tasks"
ON public.task_assignees
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = task_assignees.task_id
    AND projects.leader_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM task_assignees AS existing_assignees
    WHERE existing_assignees.task_id = task_assignees.task_id
    AND existing_assignees.user_id = auth.uid()
  )
);