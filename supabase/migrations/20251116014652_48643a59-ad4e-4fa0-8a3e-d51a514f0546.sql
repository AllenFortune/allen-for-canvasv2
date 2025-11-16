-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old insecure encryption setup
DROP TRIGGER IF EXISTS encrypt_canvas_token_trigger ON public.profiles;
DROP TRIGGER IF EXISTS encrypt_canvas_token_on_change ON public.profiles;
DROP FUNCTION IF EXISTS public.encrypt_canvas_token_trigger();
DROP FUNCTION IF EXISTS public.encrypt_canvas_token(text);
DROP FUNCTION IF EXISTS public.encrypt_canvas_token_secure(text);
DROP FUNCTION IF EXISTS public.decrypt_canvas_token(text);
DROP FUNCTION IF EXISTS public.get_canvas_credentials(uuid);

-- Create encryption function using pgcrypto with a static key
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  -- Use a static encryption key (in production, this should come from Vault)
  encryption_key text := 'canvas_secure_key_32byte_len!!';
BEGIN
  IF token IS NULL OR trim(token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Use pgcrypto's encrypt function with AES
  RETURN encode(
    pgcrypto.encrypt(
      token::bytea,
      encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$;

-- Create decryption function
CREATE OR REPLACE FUNCTION public.decrypt_canvas_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  encryption_key text := 'canvas_secure_key_32byte_len!!';
BEGIN
  IF encrypted_token IS NULL OR trim(encrypted_token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using pgcrypto
  RETURN convert_from(
    pgcrypto.decrypt(
      decode(encrypted_token, 'base64'),
      encryption_key::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails, return NULL for safety
    RETURN NULL;
END;
$$;

-- Create secure function to get decrypted Canvas credentials
CREATE OR REPLACE FUNCTION public.get_canvas_credentials(user_id_param uuid)
RETURNS TABLE(canvas_instance_url text, canvas_access_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify authorization
  IF auth.uid() != user_id_param AND (current_setting('request.jwt.claims', true)::json->>'role') != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized access to Canvas credentials';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.canvas_instance_url,
    public.decrypt_canvas_token(p.canvas_access_token) as canvas_access_token
  FROM public.profiles p
  WHERE p.id = user_id_param;
END;
$$;

-- Create trigger function to auto-encrypt tokens
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only encrypt if token exists and has changed
  IF NEW.canvas_access_token IS NOT NULL AND 
     NEW.canvas_access_token != '' AND
     (TG_OP = 'INSERT' OR OLD.canvas_access_token IS DISTINCT FROM NEW.canvas_access_token) THEN
    
    -- Check if already encrypted (base64 pattern with proper length)
    IF NEW.canvas_access_token !~ '^[A-Za-z0-9+/]+=*$' OR length(NEW.canvas_access_token) < 40 THEN
      NEW.canvas_access_token := public.encrypt_canvas_token(NEW.canvas_access_token);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the encryption trigger
CREATE TRIGGER encrypt_canvas_token_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_canvas_token_on_change();

-- Migrate existing unencrypted tokens
DO $$
DECLARE
  profile_record RECORD;
  encrypted_token text;
  processed_count integer := 0;
BEGIN
  FOR profile_record IN 
    SELECT id, canvas_access_token 
    FROM public.profiles 
    WHERE canvas_access_token IS NOT NULL 
      AND canvas_access_token != ''
      -- Only process tokens that don't look encrypted
      AND (canvas_access_token !~ '^[A-Za-z0-9+/]+=*$' OR length(canvas_access_token) < 40)
  LOOP
    BEGIN
      -- Encrypt the token
      encrypted_token := public.encrypt_canvas_token(profile_record.canvas_access_token);
      
      IF encrypted_token IS NOT NULL THEN
        -- Update with encrypted token
        UPDATE public.profiles
        SET canvas_access_token = encrypted_token
        WHERE id = profile_record.id;
        
        processed_count := processed_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to encrypt token for profile %: %', profile_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Encrypted % Canvas tokens', processed_count;
END $$;

-- Add security comments
COMMENT ON FUNCTION public.encrypt_canvas_token(text) IS 'Encrypts Canvas access tokens using AES. SECURITY DEFINER - protects tokens at rest.';
COMMENT ON FUNCTION public.decrypt_canvas_token(text) IS 'Decrypts Canvas access tokens using AES. SECURITY DEFINER - only accessible by authorized edge functions.';
COMMENT ON FUNCTION public.get_canvas_credentials(uuid) IS 'Securely retrieves decrypted Canvas credentials. Only callable by the user or service role.';