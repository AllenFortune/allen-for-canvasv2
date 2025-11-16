-- Update get_canvas_credentials to handle both encrypted and plain-text tokens
-- This allows for gradual migration of existing tokens

CREATE OR REPLACE FUNCTION get_canvas_credentials(user_id_param UUID)
RETURNS TABLE (
  canvas_instance_url TEXT,
  canvas_access_token TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_token TEXT;
  decrypted_token TEXT;
BEGIN
  -- Get the stored token
  SELECT p.canvas_access_token INTO encrypted_token
  FROM profiles p
  WHERE p.id = user_id_param;

  -- If no token found, return empty
  IF encrypted_token IS NULL THEN
    RETURN;
  END IF;

  -- Try to decrypt the token
  -- If decryption fails, assume it's already plain text
  BEGIN
    decrypted_token := decrypt_canvas_token(encrypted_token);
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, treat as plain text
    decrypted_token := encrypted_token;
  END;

  -- Return the credentials
  RETURN QUERY
  SELECT 
    p.canvas_instance_url,
    decrypted_token as canvas_access_token
  FROM profiles p
  WHERE p.id = user_id_param
    AND p.canvas_instance_url IS NOT NULL
    AND p.canvas_access_token IS NOT NULL;
END;
$$;