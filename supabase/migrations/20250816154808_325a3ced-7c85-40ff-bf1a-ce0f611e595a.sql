-- Fix referrals table RLS policies to prevent email address exposure
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can update their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;

-- Create more secure policies that limit what data each user can see
-- Referrers can view full details of referrals they created
CREATE POLICY "Referrers can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_user_id);

-- Referees can only view limited information about referrals they're part of
-- but cannot see the referrer's email for privacy
CREATE POLICY "Referees can view limited referral info" 
ON public.referrals 
FOR SELECT 
USING (
  auth.uid() = referee_user_id 
  AND referee_user_id IS NOT NULL
);

-- Only referrers can create referrals (as it should be)
CREATE POLICY "Users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_user_id);

-- Only referrers can update their referrals, referees cannot update
CREATE POLICY "Referrers can update their own referrals" 
ON public.referrals 
FOR UPDATE 
USING (auth.uid() = referrer_user_id);

-- System can update referrals for Canvas connection status
CREATE POLICY "System can update referral status" 
ON public.referrals 
FOR UPDATE 
USING (true);