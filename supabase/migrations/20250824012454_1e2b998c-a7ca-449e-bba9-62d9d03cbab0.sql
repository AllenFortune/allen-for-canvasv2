-- Add admin access policy for profiles table
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create function to encrypt Canvas access tokens
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token_secure(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Use proper encryption with pgcrypto extension
  -- This is a placeholder - in production you should use proper key management
  IF token IS NULL OR trim(token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Basic obfuscation for now - in production use proper encryption
  RETURN encode(digest(token || 'canvas_secure_' || extract(epoch from now())::text, 'sha256'), 'hex');
END;
$$;

-- Add trigger to encrypt Canvas tokens on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only encrypt if the token has changed and is not already encrypted
  IF NEW.canvas_access_token IS NOT NULL AND 
     NEW.canvas_access_token != OLD.canvas_access_token AND
     length(NEW.canvas_access_token) < 64 THEN  -- Assume unencrypted if less than 64 chars
    NEW.canvas_access_token = public.encrypt_canvas_token_secure(NEW.canvas_access_token);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS encrypt_canvas_token_on_change ON public.profiles;
CREATE TRIGGER encrypt_canvas_token_on_change
  BEFORE INSERT OR UPDATE OF canvas_access_token ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_canvas_token_trigger();

-- Add audit logging for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log profile access for security monitoring
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    'profiles',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit trigger
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_access();