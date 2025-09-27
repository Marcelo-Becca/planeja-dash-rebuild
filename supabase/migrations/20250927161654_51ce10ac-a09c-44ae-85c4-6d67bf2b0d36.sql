-- Fix security warnings by setting search_path for all functions

-- Update the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

-- Update the function to sync task progress with status
CREATE OR REPLACE FUNCTION public.sync_task_progress_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Update the function to log activity changes
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update the function to generate invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Update the function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invitations 
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$;

-- Update the function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;