
-- Update the generate_referral_code function to create personalized codes
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code text;
  user_name text;
  first_initial text;
  last_name text;
  sanitized_last_name text;
  base_code text;
  counter integer := 1;
  exists_check boolean;
BEGIN
  -- Get user's full name from profiles
  SELECT full_name INTO user_name 
  FROM public.profiles 
  WHERE id = user_id_param;
  
  -- If no full name or empty, fallback to random generation
  IF user_name IS NULL OR trim(user_name) = '' THEN
    LOOP
      code := 'FREE10' || upper(substr(md5(user_id_param::text || random()::text), 1, 6));
      SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists_check;
      IF NOT exists_check THEN
        EXIT;
      END IF;
    END LOOP;
    RETURN code;
  END IF;
  
  -- Parse the name to get first initial and last name
  user_name := trim(user_name);
  
  -- Get first initial
  first_initial := upper(left(user_name, 1));
  
  -- Get last name (everything after the last space, or the whole name if no space)
  IF position(' ' in user_name) > 0 THEN
    last_name := trim(substring(user_name from '.*\s(.+)$'));
  ELSE
    last_name := user_name;
  END IF;
  
  -- Sanitize last name (remove special characters, keep only alphanumeric)
  sanitized_last_name := upper(regexp_replace(last_name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Truncate if too long (max 10 characters for last name to keep total reasonable)
  IF length(sanitized_last_name) > 10 THEN
    sanitized_last_name := left(sanitized_last_name, 10);
  END IF;
  
  -- Create base code
  base_code := 'FREE10' || first_initial || sanitized_last_name;
  
  -- Check for uniqueness and add counter if needed
  code := base_code;
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists_check;
    IF NOT exists_check THEN
      EXIT;
    END IF;
    counter := counter + 1;
    code := base_code || counter::text;
  END LOOP;
  
  RETURN code;
END;
$$;
