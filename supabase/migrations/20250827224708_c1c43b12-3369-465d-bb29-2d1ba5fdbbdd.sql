-- Drop and recreate the get_admin_user_list function to include account_status
DROP FUNCTION IF EXISTS public.get_admin_user_list();

CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE(
  id uuid, 
  email text, 
  full_name text, 
  school_name text, 
  canvas_connected boolean, 
  created_at timestamp with time zone, 
  last_usage_date timestamp with time zone, 
  total_submissions integer, 
  subscription_tier text, 
  subscription_status text, 
  current_month_submissions integer, 
  purchased_submissions integer, 
  subscription_limit integer,
  account_status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    END as subscription_limit,
    COALESCE(s.account_status, 'active') as account_status
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
$function$;