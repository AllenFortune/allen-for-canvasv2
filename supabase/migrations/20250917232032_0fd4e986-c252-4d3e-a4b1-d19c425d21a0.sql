-- Create function to get monthly revenue statistics
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
  FROM current_month cm, previous_month pm;
$function$;

-- Create function to get weekly revenue trend
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
  FROM current_week_new cwn, previous_week_new pwn, churned_this_week ctw;
$function$;