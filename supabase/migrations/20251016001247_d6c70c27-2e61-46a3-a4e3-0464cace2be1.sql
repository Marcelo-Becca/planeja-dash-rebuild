-- Remove the created_by from being manually set and add a DEFAULT
ALTER TABLE public.calendar_events 
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Update the INSERT policy to only check if user is authenticated
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.calendar_events;

CREATE POLICY "Authenticated users can create events"
ON public.calendar_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);