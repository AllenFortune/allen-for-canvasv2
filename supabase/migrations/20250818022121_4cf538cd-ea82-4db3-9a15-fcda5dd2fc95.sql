-- Fix the update_rubrics_updated_at function to include explicit search_path
-- This resolves the Function Search Path Mutable security warning

CREATE OR REPLACE FUNCTION public.update_rubrics_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;