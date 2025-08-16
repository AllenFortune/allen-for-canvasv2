-- Fix security issues identified in scan

-- 1. Secure feature_notifications table - require authentication for creating notifications
DROP POLICY IF EXISTS "Anyone can create notification requests" ON public.feature_notifications;

CREATE POLICY "Authenticated users can create notification requests" 
ON public.feature_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 2. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE(total_users integer, canvas_connected integer, canvas_not_connected integer, recent_signups integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_users,
    COUNT(CASE WHEN p.canvas_access_token IS NOT NULL THEN 1 END)::INTEGER as canvas_connected,
    COUNT(CASE WHEN p.canvas_access_token IS NULL THEN 1 END)::INTEGER as canvas_not_connected,
    COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_signups
  FROM public.profiles p;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE(id uuid, email text, full_name text, school_name text, canvas_connected boolean, created_at timestamp with time zone, last_usage_date timestamp with time zone, total_submissions integer, subscription_tier text, subscription_status text, current_month_submissions integer, purchased_submissions integer, subscription_limit integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.school_name,
    (p.canvas_access_token IS NOT NULL) as canvas_connected,
    p.created_at,
    ut_current.updated_at as last_usage_date,
    COALESCE(ut_all.total_submissions, 0) as total_submissions,
    COALESCE(s.subscription_tier, 'Free Trial') as subscription_tier,
    CASE 
      WHEN s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > NOW()) THEN 'Active'
      WHEN s.subscription_end IS NOT NULL AND s.subscription_end <= NOW() THEN 'Expired'
      ELSE 'Trial'
    END as subscription_status,
    COALESCE(ut_current.submissions_used, 0) as current_month_submissions,
    COALESCE(sp.total_purchased, 0) as purchased_submissions,
    CASE s.subscription_tier
      WHEN 'Lite Plan' THEN 250
      WHEN 'Core Plan' THEN 750
      WHEN 'Full-Time Plan' THEN 2000
      WHEN 'Super Plan' THEN 3000
      ELSE 10
    END as subscription_limit
  FROM public.profiles p
  LEFT JOIN public.usage_tracking ut_current ON p.email = ut_current.email 
    AND ut_current.month_year = TO_CHAR(NOW(), 'YYYY-MM')
  LEFT JOIN (
    SELECT email, SUM(submissions_used) as total_submissions, MAX(updated_at) as last_updated
    FROM public.usage_tracking
    GROUP BY email
  ) ut_all ON p.email = ut_all.email
  LEFT JOIN public.subscribers s ON p.email = s.email
  LEFT JOIN (
    SELECT email, SUM(submissions_purchased) as total_purchased
    FROM public.submission_purchases
    WHERE status = 'completed'
    GROUP BY email
  ) sp ON p.email = sp.email
  ORDER BY p.created_at DESC;
$$;

-- 3. Restrict overly permissive system policies on specific tables
-- Update feature_notifications policies to be more restrictive
DROP POLICY IF EXISTS "System can update notifications" ON public.feature_notifications;

CREATE POLICY "Authenticated users can update their own notifications" 
ON public.feature_notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Update submission_purchases policies to be more restrictive
DROP POLICY IF EXISTS "insert_purchase" ON public.submission_purchases;
DROP POLICY IF EXISTS "update_purchase" ON public.submission_purchases;

-- Keep the existing secure policies only
-- The remaining policies already properly restrict access to user_id = auth.uid()