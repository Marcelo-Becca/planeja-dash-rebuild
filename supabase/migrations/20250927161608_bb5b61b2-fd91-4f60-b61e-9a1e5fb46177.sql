-- Create ENUM types for the application
CREATE TYPE app_role AS ENUM ('owner', 'admin', 'member', 'observer');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled');
CREATE TYPE activity_type AS ENUM ('project_created', 'project_updated', 'project_deleted', 'task_created', 'task_updated', 'task_deleted', 'task_progress_updated', 'team_created', 'team_updated', 'team_deleted', 'invitation_sent', 'invitation_accepted', 'invitation_rejected', 'invitation_cancelled', 'member_added', 'member_removed');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  company TEXT,
  role app_role NOT NULL DEFAULT 'member',
  email_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  status project_status NOT NULL DEFAULT 'planning',
  priority project_priority NOT NULL DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  due_date TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('project', 'team')),
  target_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(recipient_email, target_type, target_id, status) -- Prevent duplicate pending invitations
);

-- Create activity logs table for audit trail
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create junction tables for many-to-many relationships
CREATE TABLE public.project_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, team_id)
);

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE public.task_assignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE TABLE public.task_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, team_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_teams ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync task progress with status
CREATE OR REPLACE FUNCTION public.sync_task_progress_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If progress is 100%, mark as completed
  IF NEW.progress_percentage = 100 AND NEW.status != 'completed' THEN
    NEW.status = 'completed';
  END IF;
  
  -- If progress > 0 and status is pending, change to in_progress
  IF NEW.progress_percentage > 0 AND NEW.status = 'pending' THEN
    NEW.status = 'in_progress';
  END IF;
  
  -- If status is completed, set progress to 100%
  IF NEW.status = 'completed' AND NEW.progress_percentage != 100 THEN
    NEW.progress_percentage = 100;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task progress/status sync
CREATE TRIGGER sync_task_progress_status_trigger 
  BEFORE INSERT OR UPDATE ON public.tasks 
  FOR EACH ROW EXECUTE FUNCTION public.sync_task_progress_status();

-- Function to log activity changes
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_type_val activity_type;
  entity_type_val TEXT;
BEGIN
  -- Determine entity type from table name
  entity_type_val = TG_TABLE_NAME;
  
  -- Determine activity type based on operation and table
  IF TG_OP = 'INSERT' THEN
    CASE TG_TABLE_NAME
      WHEN 'projects' THEN activity_type_val = 'project_created';
      WHEN 'tasks' THEN activity_type_val = 'task_created';
      WHEN 'teams' THEN activity_type_val = 'team_created';
      WHEN 'invitations' THEN activity_type_val = 'invitation_sent';
      ELSE activity_type_val = 'project_created'; -- fallback
    END CASE;
    
    INSERT INTO public.activity_logs (actor_id, activity_type, entity_type, entity_id, new_values)
    VALUES (auth.uid(), activity_type_val, entity_type_val, NEW.id, to_jsonb(NEW));
    
  ELSIF TG_OP = 'UPDATE' THEN
    CASE TG_TABLE_NAME
      WHEN 'projects' THEN activity_type_val = 'project_updated';
      WHEN 'tasks' THEN 
        IF OLD.progress_percentage != NEW.progress_percentage THEN
          activity_type_val = 'task_progress_updated';
        ELSE
          activity_type_val = 'task_updated';
        END IF;
      WHEN 'teams' THEN activity_type_val = 'team_updated';
      ELSE activity_type_val = 'project_updated'; -- fallback
    END CASE;
    
    INSERT INTO public.activity_logs (actor_id, activity_type, entity_type, entity_id, old_values, new_values)
    VALUES (auth.uid(), activity_type_val, entity_type_val, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    
  ELSIF TG_OP = 'DELETE' THEN
    CASE TG_TABLE_NAME
      WHEN 'projects' THEN activity_type_val = 'project_deleted';
      WHEN 'tasks' THEN activity_type_val = 'task_deleted';
      WHEN 'teams' THEN activity_type_val = 'team_deleted';
      ELSE activity_type_val = 'project_deleted'; -- fallback
    END CASE;
    
    INSERT INTO public.activity_logs (actor_id, activity_type, entity_type, entity_id, old_values)
    VALUES (auth.uid(), activity_type_val, entity_type_val, OLD.id, to_jsonb(OLD));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity logging triggers
CREATE TRIGGER log_project_activity AFTER INSERT OR UPDATE OR DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER log_task_activity AFTER INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER log_team_activity AFTER INSERT OR UPDATE OR DELETE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER log_invitation_activity AFTER INSERT OR UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Function to check if user can access project
CREATE OR REPLACE FUNCTION public.can_access_project(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Owner can access
    SELECT 1 FROM public.projects WHERE id = _project_id AND owner_id = _user_id
    UNION
    -- Team members can access
    SELECT 1 FROM public.project_teams pt
    JOIN public.team_members tm ON pt.team_id = tm.team_id
    WHERE pt.project_id = _project_id AND tm.user_id = _user_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for teams
CREATE POLICY "Users can view teams they are members of" ON public.teams FOR SELECT 
  USING (public.is_team_member(auth.uid(), id) OR leader_id = auth.uid());
CREATE POLICY "Team leaders can update their teams" ON public.teams FOR UPDATE 
  USING (leader_id = auth.uid());
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT 
  WITH CHECK (leader_id = auth.uid());
CREATE POLICY "Team leaders can delete their teams" ON public.teams FOR DELETE 
  USING (leader_id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Users can view projects they have access to" ON public.projects FOR SELECT
  USING (public.can_access_project(auth.uid(), id));
CREATE POLICY "Project owners can update their projects" ON public.projects FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Project owners can delete their projects" ON public.projects FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks from accessible projects" ON public.tasks FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));
CREATE POLICY "Users can create tasks in accessible projects" ON public.tasks FOR INSERT
  WITH CHECK (public.can_access_project(auth.uid(), project_id));
CREATE POLICY "Users can update tasks in accessible projects" ON public.tasks FOR UPDATE
  USING (public.can_access_project(auth.uid(), project_id));
CREATE POLICY "Project owners can delete tasks" ON public.tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()));

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations they sent or received" ON public.invitations FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR recipient_email = auth.email());
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update invitations they sent or received" ON public.invitations FOR UPDATE
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- RLS Policies for activity logs
CREATE POLICY "Users can view activity logs for accessible entities" ON public.activity_logs FOR SELECT
  USING (
    CASE entity_type
      WHEN 'projects' THEN public.can_access_project(auth.uid(), entity_id)
      WHEN 'tasks' THEN EXISTS (SELECT 1 FROM public.tasks WHERE id = entity_id AND public.can_access_project(auth.uid(), project_id))
      WHEN 'teams' THEN public.is_team_member(auth.uid(), entity_id)
      ELSE false
    END
  );

-- RLS Policies for junction tables
CREATE POLICY "Users can view project teams for accessible projects" ON public.project_teams FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));

CREATE POLICY "Users can view team members for accessible teams" ON public.team_members FOR SELECT
  USING (public.is_team_member(auth.uid(), team_id) OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()));

CREATE POLICY "Users can view task assignees for accessible tasks" ON public.task_assignees FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND public.can_access_project(auth.uid(), project_id)));

CREATE POLICY "Users can view task teams for accessible tasks" ON public.task_teams FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND public.can_access_project(auth.uid(), project_id)));

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.invitations 
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_recipient_email ON public.invitations(recipient_email);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);