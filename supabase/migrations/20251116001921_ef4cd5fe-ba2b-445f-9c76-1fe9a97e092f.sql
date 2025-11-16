-- Add unlimited override column for special accounts
ALTER TABLE public.subscribers 
ADD COLUMN unlimited_override boolean DEFAULT false;

-- Set unlimited override for Allen Fortune's account
UPDATE public.subscribers 
SET unlimited_override = true 
WHERE email = 'allenfortune@whccd.edu';

-- Add comment for documentation
COMMENT ON COLUMN public.subscribers.unlimited_override IS 'When true, grants unlimited submissions regardless of subscription tier. Used for founder and special accounts.';