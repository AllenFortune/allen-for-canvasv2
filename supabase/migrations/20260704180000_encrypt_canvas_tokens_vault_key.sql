-- A4: Encrypt Canvas access tokens at rest with a Vault-managed key.
--
-- State before this migration (verified against live DB 2026-07-04):
--   * 26 Canvas tokens stored, ALL plaintext.
--   * No encryption trigger on profiles.
--   * encrypt/decrypt functions existed but used a symmetric key hardcoded in
--     git ('canvas_secure_key_32byte_len!!') — worthless.
--
-- Fix: generate a random 32-byte key INSIDE Postgres (never leaves the DB),
-- store it in Vault, rewrite encrypt/decrypt to use it, re-encrypt the existing
-- plaintext tokens, and add a trigger so future tokens are encrypted on write.
--
-- Safe to re-run: key creation is guarded, re-encryption only targets plaintext
-- tokens (they contain '~'; base64 ciphertext does not), and functions/trigger
-- use CREATE OR REPLACE / DROP IF EXISTS.

-- 1. Random 32-byte key in Vault, generated in-DB. Never materialized outside.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'canvas_token_key') THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'canvas_token_key',
      'AES key for encrypting profiles.canvas_access_token at rest'
    );
  END IF;
END $$;

-- 2. Encrypt/decrypt now read the key from Vault instead of a hardcoded string.
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  key_hex text;
BEGIN
  IF token IS NULL OR trim(token) = '' THEN
    RETURN NULL;
  END IF;
  SELECT decrypted_secret INTO key_hex FROM vault.decrypted_secrets WHERE name = 'canvas_token_key';
  RETURN encode(
    extensions.encrypt(token::bytea, decode(key_hex, 'hex'), 'aes'),
    'base64'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_canvas_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  key_hex text;
  decrypted_result text;
BEGIN
  IF encrypted_token IS NULL OR trim(encrypted_token) = '' THEN
    RETURN NULL;
  END IF;
  -- Back-compat: a plaintext Canvas token (NNNN~XXXX) is returned as-is.
  IF encrypted_token ~ '^\s*\d+~[A-Za-z0-9]+\s*$' THEN
    RETURN trim(encrypted_token);
  END IF;
  SELECT decrypted_secret INTO key_hex FROM vault.decrypted_secrets WHERE name = 'canvas_token_key';
  BEGIN
    decrypted_result := convert_from(
      extensions.decrypt(decode(encrypted_token, 'base64'), decode(key_hex, 'hex'), 'aes'),
      'utf8'
    );
    RETURN trim(regexp_replace(decrypted_result, E'[\\r\\n\\s]+', '', 'g'));
  EXCEPTION
    WHEN OTHERS THEN
      -- Decryption failed — return the input unchanged so callers degrade
      -- gracefully instead of losing the token.
      RETURN trim(encrypted_token);
  END;
END;
$function$;

-- 3. Re-encrypt existing plaintext tokens (all contain '~'; ciphertext does not).
UPDATE public.profiles
SET canvas_access_token = public.encrypt_canvas_token(canvas_access_token)
WHERE canvas_access_token IS NOT NULL
  AND canvas_access_token LIKE '%~%';

-- 4. Encrypt on write. Only touches plaintext values (guard on '~'), so it is a
--    no-op for already-encrypted tokens on unrelated profile updates.
CREATE OR REPLACE FUNCTION public.encrypt_canvas_token_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.canvas_access_token IS NOT NULL AND NEW.canvas_access_token LIKE '%~%' THEN
    NEW.canvas_access_token := public.encrypt_canvas_token(NEW.canvas_access_token);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS encrypt_canvas_token_trigger ON public.profiles;
CREATE TRIGGER encrypt_canvas_token_trigger
  BEFORE INSERT OR UPDATE OF canvas_access_token ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_canvas_token_on_change();
