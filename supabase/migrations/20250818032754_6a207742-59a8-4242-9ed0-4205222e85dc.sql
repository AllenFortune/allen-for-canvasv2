-- Fix webhook_events security issue by restricting access to service role only
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "service_role_access" ON public.webhook_events;

-- Create new restrictive policy for service role only
CREATE POLICY "service_role_only_access" ON public.webhook_events
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');