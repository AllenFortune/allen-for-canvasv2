
-- Create app role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Create user_roles table for admin access
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get admin user stats
CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE(
  total_users INTEGER,
  canvas_connected INTEGER,
  canvas_not_connected INTEGER,
  recent_signups INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_users,
    COUNT(CASE WHEN p.canvas_access_token IS NOT NULL THEN 1 END)::INTEGER as canvas_connected,
    COUNT(CASE WHEN p.canvas_access_token IS NULL THEN 1 END)::INTEGER as canvas_not_connected,
    COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_signups
  FROM public.profiles p;
$$;

-- Create function to get detailed user list for admin
CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  school_name TEXT,
  canvas_connected BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  last_usage_date TIMESTAMP WITH TIME ZONE,
  total_submissions INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.school_name,
    (p.canvas_access_token IS NOT NULL) as canvas_connected,
    p.created_at,
    ut.updated_at as last_usage_date,
    COALESCE(ut.submissions_used, 0) as total_submissions
  FROM public.profiles p
  LEFT JOIN public.usage_tracking ut ON p.email = ut.email 
    AND ut.month_year = TO_CHAR(NOW(), 'YYYY-MM')
  ORDER BY p.created_at DESC;
$$;

-- Create table to track admin email campaigns
CREATE TABLE IF NOT EXISTS public.admin_email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'canvas_setup', 'welcome', 'usage_reminder'
    sent_to_email TEXT NOT NULL,
    sent_by_admin_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    template_used TEXT,
    success BOOLEAN DEFAULT true
);

-- Enable RLS on email campaigns
ALTER TABLE public.admin_email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin access only
CREATE POLICY "Only admins can view user roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can view email campaigns" ON public.admin_email_campaigns
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin role for your support email (will need to be done after user exists)
-- This will be handled in the admin setup process
