
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
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const refreshSession = async () => {
    try {
      console.log('Attempting to refresh session...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }
      console.log('Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  const checkSubscription = async (shouldRetry = true) => {
    if (!user || !session?.access_token) {
      // Try to get cached subscription data from database
      if (user?.email) {
        await getFallbackSubscriptionData();
      }
      setLoading(false);
      return;
    }

    setSubscriptionError(null);

    try {
      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        
        // Check if this is a session expiration error
        if (error.message?.includes('SESSION_EXPIRED') || 
            data?.error === 'SESSION_EXPIRED') {
          console.log('Session expired, attempting to refresh...');
          
          // Try to refresh session before giving up
          if (shouldRetry && retryCount < 2) {
            const refreshed = await refreshSession();
            if (refreshed) {
              console.log('Session refreshed, retrying subscription check...');
              setRetryCount(prev => prev + 1);
              // Wait a moment for the session to propagate
              await new Promise(resolve => setTimeout(resolve, 1000));
              return checkSubscription(false);
            }
          }
          
          // If refresh failed, try fallback data instead of signing out
          console.log('Session refresh failed, using fallback subscription data');
          await getFallbackSubscriptionData();
          setSubscriptionError('Session expired - showing cached data');
          return;
        }
        
        // For other errors, try fallback data
        await getFallbackSubscriptionData();
        throw error;
      }

      // Reset retry count on success
      setRetryCount(0);
      console.log('Subscription data received:', data);
      
      let subscriptionData = data;
      
      // Get billing info for the user
      if (data && user.email) {
        const { data: billingData, error: billingError } = await supabase.rpc('get_user_billing_info', {
          user_email: user.email
        });

        if (!billingError && billingData && billingData.length > 0) {
          const billing = billingData[0];
          subscriptionData = {
            ...data,
            billing_cycle_start: billing.billing_cycle_start,
            next_reset_date: billing.next_reset_date,
            days_remaining: billing.days_remaining
          };
        }
      }
      
      setSubscription(subscriptionData);
      
      // Pass the fresh subscription data directly to getCurrentUsage
      await getCurrentUsage(subscriptionData);
    } catch (error) {
      console.error('Error checking subscription:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubscriptionError(errorMessage);
      
      // For other errors, show toast but don't redirect
      toast({
        title: "Subscription Status Unavailable",
        description: "Unable to load subscription data. Click refresh to try again.",
        variant: "destructive",
      });
      
      // Still try to get usage data even if subscription check fails
      await getCurrentUsage();
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSubscriptionData = async () => {
    if (!user?.email) return;

    try {
      console.log('Getting fallback subscription data from database...');
      
      // Get stored subscription data from database
      const { data: subscriberData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error getting fallback subscription data:', error);
        return;
      }

      if (subscriberData) {
        console.log('Found cached subscription data:', subscriberData);
        
        const fallbackData = {
          subscribed: subscriberData.subscribed,
          subscription_tier: subscriberData.subscription_tier || 'Free Trial',
          subscription_end: subscriberData.subscription_end,
          billing_cycle_start: subscriberData.billing_cycle_start,
          next_reset_date: subscriberData.next_reset_date,
          days_remaining: subscriberData.next_reset_date ? 
            Math.max(0, Math.ceil((new Date(subscriberData.next_reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
        };
        
        setSubscription(fallbackData);
        
        // Get usage data using the fallback subscription data
        await getCurrentUsage(fallbackData);
      }
    } catch (error) {
      console.error('Error in getFallbackSubscriptionData:', error);
    }
  };

  const getCurrentUsage = async (freshSubscriptionData?: SubscriptionData) => {
    if (!user?.email) return;

    try {
      // Use fresh subscription data if provided, otherwise fall back to state
      const subscriptionToUse = freshSubscriptionData || subscription;
      
      console.log('Getting current usage with subscription:', subscriptionToUse);
      
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
      
      // Calculate base limit using the subscription data
      const subscriptionTier = subscriptionToUse?.subscription_tier || 'Free Trial';
      console.log('Calculating limit for subscription tier:', subscriptionTier);
      
      const base_limit = PLAN_LIMITS[subscriptionTier as keyof typeof PLAN_LIMITS] || 10;
      console.log('Base limit determined:', base_limit, 'for tier:', subscriptionTier);
      
      // Handle unlimited plans (Full-Time Plan has -1 limit)
      const isUnlimited = base_limit === -1;
      const total_limit = isUnlimited ? -1 : base_limit + purchased_submissions;
      const percentage = isUnlimited ? 0 : (total_limit > 0 ? (submissions_used / total_limit) * 100 : 0);

      // Get billing period for display
      const { data: trackingData } = await supabase
        .from('usage_tracking')
        .select('billing_period')
        .eq('email', user.email)
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .single();

      const newUsageData = { 
        submissions_used, 
        limit: isUnlimited ? -1 : base_limit,
        purchased_submissions: isUnlimited ? 0 : purchased_submissions,
        total_limit, 
        percentage,
        billing_period: trackingData?.billing_period || null
      };
      
      console.log('Usage data calculated:', newUsageData);
      setUsage(newUsageData);
      
      // Force subscription refresh if tier shows mismatched usage
      if (subscriptionToUse?.subscription_tier === 'Lite Plan' && submissions_used >= 250) {
        console.log('Detected potential tier mismatch - forcing subscription refresh');
        setTimeout(() => checkSubscription(false), 1000);
      }
    } catch (error) {
      console.error('Error getting usage:', error);
    }
  };

  return {
    subscription,
    usage,
    loading,
    subscriptionError,
    setSubscription,
    setUsage,
    checkSubscription,
    getCurrentUsage
  };
};
