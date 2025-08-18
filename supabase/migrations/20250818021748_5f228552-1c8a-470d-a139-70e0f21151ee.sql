-- Fix overly permissive RLS policies that allow unrestricted data creation
-- This addresses critical security vulnerabilities where attackers could:
-- 1. Create fake subscription records
-- 2. Manipulate usage data  
-- 3. Spam audit logs
-- 4. Create fraudulent referrals and rewards

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow insert for subscription updates" ON public.subscribers;
DROP POLICY IF EXISTS "Allow insert for usage tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can create rewards" ON public.referral_rewards;

-- Create secure replacement policies for subscribers table
-- Only allow inserts for authenticated users creating their own subscription
CREATE POLICY "Users can create their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert subscription updates (for Stripe webhooks)
CREATE POLICY "Service role can insert subscription updates" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() = user_id
);

-- Create secure replacement policies for usage_tracking table
-- Only allow inserts for authenticated users tracking their own usage
CREATE POLICY "Users can track their own usage" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert usage tracking (for system operations)
CREATE POLICY "Service role can insert usage tracking" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() = user_id
);

-- Create secure replacement policies for audit_logs table
-- Only allow authenticated users to log their own actions
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert audit logs for system operations
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() = user_id
);

-- Create secure replacement policies for referral_rewards table
-- Only service role can create referral rewards (automated process)
CREATE POLICY "Service role can create referral rewards" 
ON public.referral_rewards 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add additional validation function for subscription tiers
CREATE OR REPLACE FUNCTION public.validate_subscription_tier(tier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow valid subscription tiers
  RETURN tier IN ('Free Trial', 'Lite Plan', 'Core Plan', 'Full-Time Plan', 'Super Plan');
END;
$$;

-- Add business logic validation for subscribers
CREATE POLICY "Validate subscription data integrity" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  -- Ensure subscription tier is valid
  validate_subscription_tier(subscription_tier) AND
  -- Ensure billing cycle start is not in the future
  billing_cycle_start <= now() AND
  -- Ensure next reset date is after billing cycle start
  (next_reset_date IS NULL OR next_reset_date > billing_cycle_start)
);

-- Add business logic validation for usage tracking
CREATE POLICY "Validate usage tracking data" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (
  -- Ensure submissions used is not negative
  submissions_used >= 0 AND
  -- Ensure month_year format is valid (YYYY-MM)
  month_year ~ '^\d{4}-\d{2}$' AND
  -- Ensure user owns the email or is service role
  (auth.email() = email OR auth.jwt() ->> 'role' = 'service_role')
);

-- Add business logic validation for audit logs
CREATE POLICY "Validate audit log data" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (
  -- Ensure action is not empty
  action IS NOT NULL AND 
  trim(action) != '' AND
  -- Ensure created_at is not in the future
  (created_at IS NULL OR created_at <= now())
);