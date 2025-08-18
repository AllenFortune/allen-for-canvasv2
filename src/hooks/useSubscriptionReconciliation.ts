import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionReconciliation = () => {
  const { user } = useAuth();

  const reconcileSubscription = useCallback(async () => {
    if (!user?.email) return;

    try {
      toast({
        title: "Refreshing subscription data...",
        description: "Syncing with Stripe to get the latest information.",
      });

      const { data, error } = await supabase.functions.invoke('reconcile-subscription', {
        body: { userEmail: user.email, forceRefresh: true }
      });

      if (error) throw error;

      toast({
        title: "Subscription data updated",
        description: "Your subscription information has been refreshed.",
      });

      // Trigger a page refresh to update the UI
      window.location.reload();

    } catch (error) {
      console.error('Error reconciling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to refresh subscription data. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.email]);

  const reconcileAllSubscriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-subscription', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "All subscriptions reconciled",
        description: "System-wide subscription data has been updated.",
      });

    } catch (error) {
      console.error('Error reconciling all subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to reconcile all subscriptions.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    reconcileSubscription,
    reconcileAllSubscriptions
  };
};