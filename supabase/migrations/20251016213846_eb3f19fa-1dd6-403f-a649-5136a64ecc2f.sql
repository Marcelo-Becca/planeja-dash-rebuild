-- Allow team leaders to change the leader (fix RLS preventing leader_id change)
-- Recreate UPDATE policy on public.teams with WITH CHECK TRUE so the new row can have a different leader_id
DROP POLICY IF EXISTS "Team leaders can update their teams" ON public.teams;

CREATE POLICY "Team leaders can update their teams"
ON public.teams
FOR UPDATE
USING (auth.uid() = leader_id)
WITH CHECK (true);