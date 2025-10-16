-- Update the INSERT policy for calendar_events to be more permissive
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.calendar_events;

CREATE POLICY "Authenticated users can create events"
ON public.calendar_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);