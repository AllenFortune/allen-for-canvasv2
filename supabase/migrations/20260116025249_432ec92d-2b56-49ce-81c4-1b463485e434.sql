-- Fix encrypt_canvas_token function to use correct schema
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  encryption_key text := 'canvas_secure_key_32byte_len!!';
BEGIN
  IF token IS NULL OR trim(token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Use extensions schema where pgcrypto is installed
  RETURN encode(
    extensions.encrypt(
      token::bytea,
      encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$;

-- Fix decrypt_canvas_token function to use correct schema
CREATE OR REPLACE FUNCTION public.decrypt_canvas_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  encryption_key text := 'canvas_secure_key_32byte_len!!';
BEGIN
  IF encrypted_token IS NULL OR trim(encrypted_token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using extensions schema where pgcrypto is installed
  RETURN convert_from(
    extensions.decrypt(
      decode(encrypted_token, 'base64'),
      encryption_key::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;