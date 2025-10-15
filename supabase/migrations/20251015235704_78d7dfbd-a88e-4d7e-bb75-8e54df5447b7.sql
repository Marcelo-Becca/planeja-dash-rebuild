-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view events they participate in or created" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can view participants of events they can see" ON public.calendar_participants;
DROP POLICY IF EXISTS "Users can view reminders of events they can see" ON public.calendar_reminders;

-- Create security definer function to check if user can access event
CREATE OR REPLACE FUNCTION public.can_access_calendar_event(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE id = _event_id
    AND (
      created_by = _user_id
      OR EXISTS (
        SELECT 1 FROM public.calendar_participants
        WHERE event_id = _event_id
        AND user_id = _user_id
      )
    )
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view events they created or participate in"
ON public.calendar_events
FOR SELECT
USING (public.can_access_calendar_event(auth.uid(), id));

CREATE POLICY "Users can view participants of accessible events"
ON public.calendar_participants
FOR SELECT
USING (public.can_access_calendar_event(auth.uid(), event_id));

CREATE POLICY "Users can view reminders of accessible events"
ON public.calendar_reminders
FOR SELECT
USING (public.can_access_calendar_event(auth.uid(), event_id));