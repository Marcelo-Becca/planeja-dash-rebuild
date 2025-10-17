-- Replace task_assignees policies to allow self-assign plus leader/assignee management
DROP POLICY IF EXISTS "Project leaders and assignees can add users to tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Project leaders and assignees can remove users from tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Project leaders can assign users to tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Project leaders can remove assignees from tasks" ON public.task_assignees;

-- INSERT: leader OR existing assignee OR self-assign
CREATE POLICY "Leaders, assignees, or self can add to tasks"
ON public.task_assignees
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = task_assignees.task_id
    AND projects.leader_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM task_assignees AS existing
    WHERE existing.task_id = task_assignees.task_id
      AND existing.user_id = auth.uid()
  )
  OR task_assignees.user_id = auth.uid()
);

-- DELETE: leader OR existing assignee OR removing self
CREATE POLICY "Leaders, assignees, or self can remove from tasks"
ON public.task_assignees
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = task_assignees.task_id
    AND projects.leader_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM task_assignees AS existing
    WHERE existing.task_id = task_assignees.task_id
      AND existing.user_id = auth.uid()
  )
  OR task_assignees.user_id = auth.uid()
);