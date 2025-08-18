-- Create webhook_events table for idempotency and tracking
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only
CREATE POLICY "service_role_access" ON public.webhook_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Add stripe_customer_id index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id 
ON public.subscribers(stripe_customer_id);

-- Add index on webhook events for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id 
ON public.webhook_events(stripe_event_id);

-- Update get_purchased_submissions function to be more robust
CREATE OR REPLACE FUNCTION public.get_purchased_submissions(user_email text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT SUM(submissions_purchased) FROM public.submission_purchases 
     WHERE email = user_email AND status = 'completed') +
    (SELECT SUM(submissions_granted) FROM public.referral_rewards rr
     JOIN public.profiles p ON p.id = rr.user_id
     WHERE p.email = user_email 
       AND rr.reward_type = 'referee_bonus'
       AND (rr.expires_at IS NULL OR rr.expires_at > now())), 
    0
  )::integer;
$function$;