-- Add ON DELETE CASCADE to project_teams
ALTER TABLE project_teams
DROP CONSTRAINT IF EXISTS project_teams_project_id_fkey,
ADD CONSTRAINT project_teams_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;

-- Add ON DELETE CASCADE to tasks
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
ADD CONSTRAINT tasks_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;

-- Add ON DELETE CASCADE to calendar_events
ALTER TABLE calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_project_id_fkey,
ADD CONSTRAINT calendar_events_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;