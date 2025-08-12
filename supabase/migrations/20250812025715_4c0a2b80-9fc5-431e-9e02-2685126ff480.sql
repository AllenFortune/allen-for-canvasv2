-- Fix security issue: Restrict feature_notifications table access
-- Remove overly permissive SELECT policies and create secure ones

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.feature_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.feature_notifications;

-- Create secure SELECT policies
-- 1. Authenticated users can only view their own notifications (where user_id matches)
CREATE POLICY "Authenticated users can view own notifications" 
ON public.feature_notifications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Admins can view all notifications (but must be authenticated)
CREATE POLICY "Admins can view all notifications" 
ON public.feature_notifications 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Remove any possibility for anonymous access to emails
-- Anonymous users should have NO SELECT access to this table

-- Keep existing INSERT policy for feature signups (this is safe as it only allows creation)
-- Keep existing UPDATE policy for system operations

-- Add comment explaining the security fix
COMMENT ON TABLE public.feature_notifications IS 'Stores feature notification requests. SELECT access restricted to authenticated users only to prevent email exposure.';