
-- Create enum for referral status
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'rewarded');

-- Create enum for reward types
CREATE TYPE reward_type AS ENUM ('referrer_bonus', 'referee_bonus');

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  referrer_email TEXT NOT NULL,
  referee_user_id UUID REFERENCES public.profiles(id),
  referee_email TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  status referral_status NOT NULL DEFAULT 'pending',
  canvas_connected_at TIMESTAMP WITH TIME ZONE,
  rewards_granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_rewards table
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID REFERENCES public.referrals(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  reward_type reward_type NOT NULL,
  submissions_granted INTEGER NOT NULL DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals table
CREATE POLICY "Users can view their own referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Users can create referrals" 
  ON public.referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update their own referrals" 
  ON public.referrals 
  FOR UPDATE 
  USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

-- RLS policies for referral_rewards table
CREATE POLICY "Users can view their own rewards" 
  ON public.referral_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards" 
  ON public.referral_rewards 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate 8-character code from email hash + random
    code := upper(substr(md5(user_email || random()::text), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to process referral rewards
CREATE OR REPLACE FUNCTION public.process_referral_rewards(referee_user_id_param uuid, referee_email_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
BEGIN
  -- Find the referral record
  SELECT * INTO referral_record 
  FROM public.referrals 
  WHERE referee_email = referee_email_param 
    AND status = 'completed'
    AND rewards_granted_at IS NULL
  LIMIT 1;
  
  IF referral_record IS NOT NULL THEN
    -- Get referrer profile
    SELECT * INTO referrer_profile 
    FROM public.profiles 
    WHERE id = referral_record.referrer_user_id;
    
    -- Grant permanent submissions to referrer (via submission_purchases)
    INSERT INTO public.submission_purchases (
      user_id, email, amount, submissions_purchased, status
    ) VALUES (
      referral_record.referrer_user_id,
      referrer_profile.email,
      0, -- Free reward
      10,
      'completed'
    );
    
    -- Grant temporary submissions to referee (via referral_rewards)
    INSERT INTO public.referral_rewards (
      referral_id, user_id, reward_type, submissions_granted, expires_at
    ) VALUES (
      referral_record.id,
      referee_user_id_param,
      'referee_bonus',
      10,
      now() + interval '30 days'
    );
    
    -- Grant permanent submissions to referrer (via referral_rewards for tracking)
    INSERT INTO public.referral_rewards (
      referral_id, user_id, reward_type, submissions_granted
    ) VALUES (
      referral_record.id,
      referral_record.referrer_user_id,
      'referrer_bonus',
      10
    );
    
    -- Mark rewards as granted
    UPDATE public.referrals 
    SET 
      status = 'rewarded',
      rewards_granted_at = now(),
      updated_at = now()
    WHERE id = referral_record.id;
  END IF;
END;
$$;

-- Create function to get user referral stats
CREATE OR REPLACE FUNCTION public.get_user_referral_stats(user_email_param text)
RETURNS TABLE(
  total_referrals integer,
  completed_referrals integer,
  pending_referrals integer,
  total_rewards_earned integer,
  referral_code text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    COUNT(*)::integer as total_referrals,
    COUNT(CASE WHEN status IN ('completed', 'rewarded') THEN 1 END)::integer as completed_referrals,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::integer as pending_referrals,
    COALESCE((
      SELECT SUM(submissions_granted) 
      FROM public.referral_rewards rr 
      JOIN public.referrals r ON r.id = rr.referral_id
      WHERE r.referrer_email = user_email_param 
        AND rr.reward_type = 'referrer_bonus'
    ), 0)::integer as total_rewards_earned,
    (
      SELECT referral_code 
      FROM public.referrals 
      WHERE referrer_email = user_email_param 
      ORDER BY created_at DESC 
      LIMIT 1
    ) as referral_code
  FROM public.referrals 
  WHERE referrer_email = user_email_param;
$$;

-- Update get_purchased_submissions to include referral bonuses
CREATE OR REPLACE FUNCTION public.get_purchased_submissions(user_email text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT SUM(submissions_purchased) FROM public.submission_purchases 
     WHERE email = user_email AND status = 'completed') +
    (SELECT SUM(submissions_granted) FROM public.referral_rewards rr
     JOIN public.profiles p ON p.id = rr.user_id
     WHERE p.email = user_email 
       AND rr.reward_type = 'referee_bonus'
       AND (rr.expires_at IS NULL OR rr.expires_at > now())), 
    0
  )::integer;
$$;
