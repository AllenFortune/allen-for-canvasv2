-- Create a table for feature launch notifications
CREATE TABLE public.feature_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(email, feature_name)
);

-- Enable Row Level Security
ALTER TABLE public.feature_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for feature notifications
CREATE POLICY "Users can view their own notifications" 
ON public.feature_notifications 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create notification requests" 
ON public.feature_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update notifications" 
ON public.feature_notifications 
FOR UPDATE 
USING (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" 
ON public.feature_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_feature_notifications_email_feature ON public.feature_notifications(email, feature_name);
CREATE INDEX idx_feature_notifications_feature_name ON public.feature_notifications(feature_name);
CREATE INDEX idx_feature_notifications_notified ON public.feature_notifications(notified_at) WHERE notified_at IS NULL;