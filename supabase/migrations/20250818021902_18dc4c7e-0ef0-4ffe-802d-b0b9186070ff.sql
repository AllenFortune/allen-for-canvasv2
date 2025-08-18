-- Fix function search path security issue
-- The validate_subscription_tier function already has SET search_path = '' 
-- but we need to ensure it's properly set for all functions

-- Update the validation function to ensure explicit search path
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