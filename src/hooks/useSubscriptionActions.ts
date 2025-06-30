
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuditLog } from './useAuditLog';
import { UsageData } from '@/types/subscription';

export const useSubscriptionActions = (usage: UsageData | null) => {
  const { session } = useAuth();
  const { logAction } = useAuditLog();

  const createCheckout = async (
    planName: string, 
    monthlyPrice: number, 
    yearlyPrice: number, 
    isYearly: boolean = false,
    couponCode?: string | null
  ) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      // Log subscription attempt
      await logAction({
        action: 'SUBSCRIPTION_CHECKOUT_INITIATED',
        table_name: 'subscribers',
        new_values: {
          plan_name: planName,
          is_yearly: isYearly,
          monthly_price: monthlyPrice,
          yearly_price: yearlyPrice,
          coupon_code: couponCode
        }
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planName, 
          monthlyPrice, 
          yearlyPrice, 
          isYearly,
          couponCode 
        },
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
      // Log submission purchase attempt
      await logAction({
        action: 'SUBMISSION_PURCHASE_INITIATED',
        table_name: 'submission_purchases',
        new_values: {
          submissions_to_purchase: 100,
          current_usage: usage?.submissions_used || 0,
          current_limit: usage?.total_limit || 0
        }
      });

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
      // Log customer portal access
      await logAction({
        action: 'CUSTOMER_PORTAL_ACCESSED',
        table_name: 'subscribers'
      });

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

  return {
    createCheckout,
    purchaseAdditionalSubmissions,
    openCustomerPortal
  };
};
