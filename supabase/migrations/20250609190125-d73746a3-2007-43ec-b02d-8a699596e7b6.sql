
-- Fix the RLS policies to allow initial admin setup
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;

-- Create more permissive policies that allow initial admin setup
-- Allow users to insert their own admin role if they are the support email
CREATE POLICY "Support email can insert admin role" ON public.user_roles
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id 
        AND role = 'admin'
        AND (
            SELECT email FROM public.profiles WHERE id = auth.uid()
        ) = 'support@allengradeassist.com'
    );

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow admins to view all roles (but only after they have admin role)
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert any role
CREATE POLICY "Admins can insert any role" ON public.user_roles
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
