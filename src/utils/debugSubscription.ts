import { supabase } from '@/integrations/supabase/client';

export const forceSubscriptionRefresh = async (userEmail: string) => {
  try {
    console.log('Forcing subscription refresh for:', userEmail);
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.access_token) {
      console.error('No session token available');
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Error in force refresh:', error);
      return false;
    }
    
    console.log('Refresh result:', data);
    return data;
  } catch (error) {
    console.error('Error forcing subscription refresh:', error);
    return false;
  }
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).forceSubscriptionRefresh = forceSubscriptionRefresh;
}