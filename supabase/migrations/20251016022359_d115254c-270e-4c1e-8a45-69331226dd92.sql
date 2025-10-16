-- Update the delete policy for projects to allow any authenticated user to delete
DROP POLICY IF EXISTS "Project leaders can delete their projects" ON public.projects;

CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);