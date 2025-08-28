
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuditLog } from './useAuditLog';
import { UsageData } from '@/types/subscription';

export const useUsageManagement = (
  usage: UsageData | null,
  setUsage: (usage: UsageData) => void,
  getCurrentUsage: (freshSubscriptionData?: any) => Promise<void>
) => {
  const { user } = useAuth();
  const { logAction } = useAuditLog();

  const incrementUsage = async (): Promise<boolean> => {
    if (!user?.email || !user?.id) return false;

    try {
      // Check current usage first - pass undefined to use existing subscription data
      await getCurrentUsage();
      
      // Check if user has unlimited plan
      const isUnlimited = usage && usage.total_limit === -1;
      
      if (usage && !isUnlimited && usage.submissions_used >= usage.total_limit) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your limit of ${usage.total_limit} submissions for this billing period. Consider purchasing additional submissions or upgrading your plan.`,
          variant: "destructive",
        });
        
        // Log the usage limit reached event
        await logAction({
          action: 'USAGE_LIMIT_REACHED',
          table_name: 'usage_tracking',
          new_values: {
            current_usage: usage.submissions_used,
            limit: usage.total_limit,
            user_email: user.email
          }
        });
        
        return false;
      }

      // Use the new billing period function
      const { data, error } = await supabase.rpc('increment_usage_with_billing_period', {
        user_email: user.email,
        user_uuid: user.id
      });

      if (error) throw error;

      // Log usage increment
      await logAction({
        action: 'USAGE_INCREMENTED',
        table_name: 'usage_tracking',
        new_values: {
          new_usage_count: data,
          user_email: user.email,
          increment_time: new Date().toISOString()
        }
      });

      // Update local usage state
      if (usage) {
        const newUsage = {
          ...usage,
          submissions_used: data,
          percentage: usage.total_limit > 0 ? (data / usage.total_limit) * 100 : 0
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

  return { incrementUsage };
};
