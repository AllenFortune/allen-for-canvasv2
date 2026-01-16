-- Step 1: Update decrypt_canvas_token to be smart about encrypted vs plain tokens
CREATE OR REPLACE FUNCTION public.decrypt_canvas_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  encryption_key text := 'canvas_secure_key_32byte_len!!';
  decrypted_result text;
BEGIN
  IF encrypted_token IS NULL OR trim(encrypted_token) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Check if this looks like a Canvas token (format: NNNN~XXXXX)
  -- Canvas tokens are always in this format - if so, return as-is (already plain text)
  IF encrypted_token ~ '^\s*\d+~[A-Za-z0-9]+\s*$' THEN
    RETURN trim(encrypted_token);
  END IF;
  
  -- Try to decrypt as encrypted token
  BEGIN
    decrypted_result := convert_from(
      extensions.decrypt(
        decode(encrypted_token, 'base64'),
        encryption_key::bytea,
        'aes'
      ),
      'utf8'
    );
    -- Remove any newlines/whitespace from decrypted result
    RETURN trim(regexp_replace(decrypted_result, E'[\\r\\n\\s]+', '', 'g'));
  EXCEPTION
    WHEN OTHERS THEN
      -- If decryption fails, return original token trimmed
      RETURN trim(encrypted_token);
  END;
END;
$$;

-- Step 2: Drop the encryption trigger to prevent future tokens from being encrypted
DROP TRIGGER IF EXISTS encrypt_canvas_token_trigger ON profiles;

-- Step 3: Decrypt all existing encrypted tokens back to plain text
UPDATE profiles
SET canvas_access_token = public.decrypt_canvas_token(canvas_access_token)
WHERE canvas_access_token IS NOT NULL
  AND canvas_access_token !~ '^\s*\d+~[A-Za-z0-9]+\s*$';