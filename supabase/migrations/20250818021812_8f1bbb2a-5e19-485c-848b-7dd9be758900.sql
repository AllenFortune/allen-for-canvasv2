-- Fix function search path security issue
-- Add explicit search_path to the validation function to prevent mutable search path vulnerability

DROP FUNCTION IF EXISTS public.validate_subscription_tier(text);

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