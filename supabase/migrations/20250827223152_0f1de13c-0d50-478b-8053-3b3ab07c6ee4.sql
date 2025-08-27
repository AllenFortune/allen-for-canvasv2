-- Add account status fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'paused', 'suspended')),
ADD COLUMN paused_at TIMESTAMPTZ,
ADD COLUMN paused_by TEXT,
ADD COLUMN pause_reason TEXT;

-- Create admin actions log table for audit trail
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  target_user_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('pause_account', 'resume_account', 'sync_subscription', 'delete_account')),
  reason TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_actions table
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view and insert admin actions
CREATE POLICY "Admins can view all admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update existing subscribers to have 'active' status if null
UPDATE public.subscribers 
SET account_status = 'active' 
WHERE account_status IS NULL;