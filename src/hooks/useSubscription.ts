
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionData } from './useSubscriptionData';
import { useUsageManagement } from './useUsageManagement';
import { useSubscriptionActions } from './useSubscriptionActions';

export const useSubscription = () => {
  const { user, session } = useAuth();
  const {
    subscription,
    usage,
    loading,
    subscriptionError,
    setSubscription,
    setUsage,
    checkSubscription,
    getCurrentUsage
  } = useSubscriptionData();

  const { incrementUsage } = useUsageManagement(usage, setUsage, getCurrentUsage);
  const { createCheckout, purchaseAdditionalSubmissions, openCustomerPortal } = useSubscriptionActions(usage);

  useEffect(() => {
    if (user && session?.access_token) {
      checkSubscription();
    }
  }, [user, session?.access_token]);

  return {
    subscription,
    usage,
    loading,
    subscriptionError,
    checkSubscription,
    incrementUsage,
    createCheckout,
    purchaseAdditionalSubmissions,
    openCustomerPortal,
    canGrade: usage ? (usage.total_limit === -1 ? true : usage.submissions_used < usage.total_limit) : false
  };
};
