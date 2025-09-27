-- Fix the get_purchased_submissions function to properly count completed purchases
CREATE OR REPLACE FUNCTION public.get_purchased_submissions(user_email text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT SUM(submissions_purchased) FROM public.submission_purchases 
     WHERE email = user_email AND status = 'completed'), 
    0
  )::integer;
$function$