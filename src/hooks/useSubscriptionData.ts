
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SubscriptionData, UsageData } from '@/types/subscription';
import { PLAN_LIMITS } from '@/constants/subscription';

export const useSubscriptionData = () => {
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
      
      // Get billing info for the user
      if (data && user.email) {
        const { data: billingData, error: billingError } = await supabase.rpc('get_user_billing_info', {
          user_email: user.email
        });

        if (!billingError && billingData && billingData.length > 0) {
          const billing = billingData[0];
          setSubscription({
            ...data,
            billing_cycle_start: billing.billing_cycle_start,
            next_reset_date: billing.next_reset_date,
            days_remaining: billing.days_remaining
          });
        } else {
          setSubscription(data);
        }
      } else {
        setSubscription(data);
      }
      
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
      // Get current month usage using the new billing period function
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
      const percentage = total_limit > 0 ? (submissions_used / total_limit) * 100 : 0;

      // Get billing period for display
      const { data: trackingData } = await supabase
        .from('usage_tracking')
        .select('billing_period')
        .eq('email', user.email)
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .single();

      setUsage({ 
        submissions_used, 
        limit: base_limit,
        purchased_submissions,
        total_limit, 
        percentage,
        billing_period: trackingData?.billing_period || null
      });
    } catch (error) {
      console.error('Error getting usage:', error);
    }
  };

  return {
    subscription,
    usage,
    loading,
    setSubscription,
    setUsage,
    checkSubscription,
    getCurrentUsage
  };
};
