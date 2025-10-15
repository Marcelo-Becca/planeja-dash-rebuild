-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  type text NOT NULL CHECK (type IN ('meeting', 'deadline', 'reminder', 'block')),
  location text,
  project_id uuid,
  team_id uuid,
  task_id uuid,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create calendar_participants table
CREATE TABLE public.calendar_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create calendar_reminders table
CREATE TABLE public.calendar_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  minutes integer NOT NULL,
  triggered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_events
CREATE POLICY "Authenticated users can view events they participate in or created"
ON public.calendar_events
FOR SELECT
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.calendar_participants
    WHERE calendar_participants.event_id = calendar_events.id
    AND calendar_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create events"
ON public.calendar_events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events"
ON public.calendar_events
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events"
ON public.calendar_events
FOR DELETE
USING (auth.uid() = created_by);

-- Create policies for calendar_participants
CREATE POLICY "Authenticated users can view participants of events they can see"
ON public.calendar_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_participants.event_id
    AND (
      calendar_events.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.calendar_participants cp
        WHERE cp.event_id = calendar_events.id
        AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Event creators can manage participants"
ON public.calendar_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_participants.event_id
    AND calendar_events.created_by = auth.uid()
  )
);

-- Create policies for calendar_reminders
CREATE POLICY "Users can view reminders of events they can see"
ON public.calendar_reminders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND (
      calendar_events.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.calendar_participants
        WHERE calendar_participants.event_id = calendar_events.id
        AND calendar_participants.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Event creators can manage reminders"
ON public.calendar_reminders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND calendar_events.created_by = auth.uid()
  )
);

-- Create trigger to update updated_at for calendar_events
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();