-- Security: gate the admin data/stat RPCs.
--
-- get_admin_user_list / get_admin_user_stats / get_monthly_revenue_stats /
-- get_weekly_revenue_trend are SECURITY DEFINER and read every user's PII and
-- revenue. They had no internal authorization check and default execute for
-- PUBLIC, so anyone with the anon key could call them and dump the roster.
--
-- Fix (defense in depth, no language conversion so RETURNS TABLE shapes are
-- preserved):
--   1. Internal row-gate: each function returns rows only when the caller
--      (auth.uid() from the request JWT, resolved even under SECURITY DEFINER)
--      is an admin. Non-admins get an empty result, not an error.
--   2. Revoke default execute from PUBLIC + anon; grant execute only to
--      authenticated (the admin portal calls these as the logged-in admin).
--
-- After applying, SMOKE TEST: call each RPC as an admin (expect data), as a
-- non-admin authenticated user (expect empty), and with the anon key (expect
-- "permission denied for function ...").

-- 1a. Per-row list: gate with WHERE.
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
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY p.created_at DESC;
$function$;

-- 1b. Aggregate stats: gate with HAVING so non-admins get zero rows.
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
  FROM public.profiles p
  HAVING public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

-- 1c. Revenue (single-row cross join of CTEs): gate with WHERE.
CREATE OR REPLACE FUNCTION public.get_monthly_revenue_stats()
RETURNS TABLE(
  current_month_mrr integer,
  previous_month_mrr integer,
  growth_percentage numeric,
  current_month_name text,
  previous_month_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH plan_prices AS (
    SELECT
      'Lite Plan' as tier, 9 as monthly_price
    UNION ALL SELECT 'Core Plan', 19
    UNION ALL SELECT 'Full-Time Plan', 59
    UNION ALL SELECT 'Super Plan', 89
  ),
  current_month AS (
    SELECT
      COALESCE(SUM(pp.monthly_price), 0) as mrr
    FROM public.subscribers s
    JOIN plan_prices pp ON s.subscription_tier = pp.tier
    WHERE s.subscribed = true
      AND (s.subscription_end IS NULL OR s.subscription_end > NOW())
      AND s.account_status = 'active'
  ),
  previous_month AS (
    SELECT
      COALESCE(SUM(pp.monthly_price), 0) as mrr
    FROM public.subscribers s
    JOIN plan_prices pp ON s.subscription_tier = pp.tier
    WHERE s.subscribed = true
      AND s.created_at < date_trunc('month', NOW())
      AND (s.subscription_end IS NULL OR s.subscription_end > (NOW() - interval '1 month'))
      AND s.account_status = 'active'
  )
  SELECT
    cm.mrr::integer,
    pm.mrr::integer,
    CASE
      WHEN pm.mrr > 0 THEN ROUND(((cm.mrr - pm.mrr) / pm.mrr * 100)::numeric, 1)
      ELSE 0
    END,
    TO_CHAR(NOW(), 'Month YYYY'),
    TO_CHAR(NOW() - interval '1 month', 'Month YYYY')
  FROM current_month cm, previous_month pm
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role);
$function$;

CREATE OR REPLACE FUNCTION public.get_weekly_revenue_trend()
RETURNS TABLE(
  current_week_new_mrr integer,
  previous_week_new_mrr integer,
  week_growth_percentage numeric,
  new_subscribers_this_week integer,
  churned_this_week integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH plan_prices AS (
    SELECT
      'Lite Plan' as tier, 9 as monthly_price
    UNION ALL SELECT 'Core Plan', 19
    UNION ALL SELECT 'Full-Time Plan', 59
    UNION ALL SELECT 'Super Plan', 89
  ),
  current_week_new AS (
    SELECT
      COUNT(*) as new_subs,
      COALESCE(SUM(pp.monthly_price), 0) as new_mrr
    FROM public.subscribers s
    JOIN plan_prices pp ON s.subscription_tier = pp.tier
    WHERE s.subscribed = true
      AND s.created_at >= date_trunc('week', NOW())
      AND s.account_status = 'active'
  ),
  previous_week_new AS (
    SELECT
      COALESCE(SUM(pp.monthly_price), 0) as new_mrr
    FROM public.subscribers s
    JOIN plan_prices pp ON s.subscription_tier = pp.tier
    WHERE s.subscribed = true
      AND s.created_at >= date_trunc('week', NOW()) - interval '1 week'
      AND s.created_at < date_trunc('week', NOW())
      AND s.account_status = 'active'
  ),
  churned_this_week AS (
    SELECT COUNT(*) as churned
    FROM public.subscribers s
    WHERE (s.subscription_end IS NOT NULL AND s.subscription_end >= date_trunc('week', NOW()))
      OR (s.account_status != 'active' AND s.updated_at >= date_trunc('week', NOW()))
  )
  SELECT
    cwn.new_mrr::integer,
    pwn.new_mrr::integer,
    CASE
      WHEN pwn.new_mrr > 0 THEN ROUND(((cwn.new_mrr - pwn.new_mrr) / pwn.new_mrr * 100)::numeric, 1)
      ELSE 0
    END,
    cwn.new_subs::integer,
    ctw.churned::integer
  FROM current_week_new cwn, previous_week_new pwn, churned_this_week ctw
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role);
$function$;

-- 2. Tighten execute privileges: no PUBLIC/anon, only authenticated.
REVOKE EXECUTE ON FUNCTION public.get_admin_user_list()        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_stats()       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_monthly_revenue_stats()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_weekly_revenue_trend()   FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_admin_user_list()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_user_stats()       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_revenue_stats()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_revenue_trend()   TO authenticated;
