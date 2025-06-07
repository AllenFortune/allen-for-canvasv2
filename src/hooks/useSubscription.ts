
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

interface UsageData {
  submissions_used: number;
  limit: number;
  purchased_submissions: number;
  total_limit: number;
  percentage: number;
}

const PLAN_LIMITS = {
  'Free Trial': 10,
  'Lite Plan': 250,
  'Core Plan': 750,
  'Full-Time Plan': 2000,
  'Super Plan': 3000
};

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user || !session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      console.log('Subscription data received:', data);
      setSubscription(data);
      
      // Get current usage including purchased submissions
      await getCurrentUsage();
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUsage = async () => {
    if (!user?.email) return;

    try {
      // Get current month usage
      const { data: usageData, error: usageError } = await supabase.rpc('get_current_month_usage', {
        user_email: user.email
      });

      if (usageError) throw usageError;

      // Get purchased submissions
      const { data: purchasedData, error: purchasedError } = await supabase.rpc('get_purchased_submissions', {
        user_email: user.email
      });

      if (purchasedError) throw purchasedError;

      const submissions_used = usageData || 0;
      const purchased_submissions = purchasedData || 0;
      const base_limit = subscription ? PLAN_LIMITS[subscription.subscription_tier as keyof typeof PLAN_LIMITS] || 10 : 10;
      const total_limit = base_limit + purchased_submissions;
      const percentage = (submissions_used / total_limit) * 100;

      setUsage({ 
        submissions_used, 
        limit: base_limit,
        purchased_submissions,
        total_limit, 
        percentage 
      });
    } catch (error) {
      console.error('Error getting usage:', error);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (!user?.email || !user?.id) return false;

    try {
      // Check current usage first
      await getCurrentUsage();
      
      if (usage && usage.submissions_used >= usage.total_limit) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your monthly limit of ${usage.total_limit} submissions. Consider purchasing additional submissions or upgrading your plan.`,
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.rpc('increment_usage', {
        user_email: user.email,
        user_uuid: user.id
      });

      if (error) throw error;

      // Update local usage state
      if (usage) {
        const newUsage = {
          ...usage,
          submissions_used: data,
          percentage: (data / usage.total_limit) * 100
        };
        setUsage(newUsage);
      }

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      toast({
        title: "Error",
        description: "Failed to track usage",
        variant: "destructive",
      });
      return false;
    }
  };

  const createCheckout = async (planName: string, monthlyPrice: number, yearlyPrice: number, isYearly: boolean = false) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName, monthlyPrice, yearlyPrice, isYearly },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const purchaseAdditionalSubmissions = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase additional submissions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-submission-purchase', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating submission purchase:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase session",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && session?.access_token) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  return {
    subscription,
    usage,
    loading,
    checkSubscription,
    incrementUsage,
    createCheckout,
    purchaseAdditionalSubmissions,
    openCustomerPortal,
    canGrade: usage ? usage.submissions_used < usage.total_limit : false
  };
};
