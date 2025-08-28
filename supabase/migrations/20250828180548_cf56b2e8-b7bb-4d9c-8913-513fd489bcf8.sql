-- Add missing admin and service role policies for profiles table
-- These policies fill security gaps without changing existing functionality

-- Allow admins to update profiles (needed for admin functions like account management)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to manage profiles (needed for backend functions)
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');