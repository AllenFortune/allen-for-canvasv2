
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  referral_code: string;
}

interface Referral {
  id: string;
  referee_email: string;
  status: 'pending' | 'completed' | 'rewarded';
  canvas_connected_at: string | null;
  rewards_granted_at: string | null;
  created_at: string;
}

export const useReferrals = () => {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralStats = async () => {
    if (!user?.email) {
      console.log('No user email available for fetchReferralStats');
      return;
    }

    try {
      console.log('Fetching referral stats for user:', user.email);
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        user_email_param: user.email
      });

      if (error) {
        console.error('Error from get_user_referral_stats:', error);
        throw error;
      }

      console.log('Referral stats response:', data);

      if (data && data.length > 0) {
        const statsData = data[0];
        console.log('Setting stats:', statsData);
        setStats(statsData);
        
        // If no referral code exists, try to create one
        if (!statsData.referral_code) {
          console.log('No referral code found, attempting to create one');
          await createReferralCode();
        }
      } else {
        console.log('No referral stats found, creating initial referral code');
        // Create initial referral code if none exists
        await createReferralCode();
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive",
      });
    }
  };

  const fetchReferrals = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetchReferrals');
      return;
    }

    try {
      console.log('Fetching referrals for user ID:', user.id);
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referee_email, status, canvas_connected_at, rewards_granted_at, created_at')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        throw error;
      }
      
      console.log('Referrals data:', data);
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const createReferralCode = async (retryCount = 0) => {
    if (!user?.email || !user?.id) {
      console.log('Missing user data for createReferralCode');
      return;
    }

    try {
      console.log('Creating referral code for user:', user.email, 'ID:', user.id);
      
      // Use the new function that takes user_id parameter
      const { data: code, error: codeError } = await supabase.rpc('generate_referral_code', {
        user_id_param: user.id
      });

      if (codeError) {
        console.error('Error generating referral code:', codeError);
        throw codeError;
      }

      console.log('Generated referral code:', code);

      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referrer_email: user.email,
          referral_code: code,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error inserting referral:', insertError);
        throw insertError;
      }

      console.log('Successfully created referral code:', code);
      
      // Refresh stats after creating code
      await fetchReferralStats();
      
      toast({
        title: "Success",
        description: `Your referral code ${code} has been created!`,
      });
    } catch (error) {
      console.error('Error creating referral code (attempt', retryCount + 1, '):', error);
      
      // Retry once if this is the first attempt
      if (retryCount === 0) {
        console.log('Retrying referral code creation...');
        setTimeout(() => createReferralCode(1), 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to create referral code. Try the 'Generate Code' button.",
        variant: "destructive",
      });
    }
  };

  const sendInvitations = async (emails: string[], message?: string) => {
    if (!session?.access_token || !stats?.referral_code) {
      toast({
        title: "Error",
        description: "Unable to send invitations at this time",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-referral-invitation', {
        body: {
          emails,
          message,
          referralCode: stats.referral_code
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitations Sent!",
        description: `Successfully sent ${data.totalSent} out of ${data.totalEmails} invitations`,
      });

      return true;
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send invitations",
        variant: "destructive",
      });
      return false;
    }
  };

  const getReferralUrl = () => {
    if (!stats?.referral_code) return '';
    return `${window.location.origin}/auth?ref=${stats.referral_code}`;
  };

  const manualGenerateCode = async () => {
    console.log('Manual referral code generation triggered');
    setLoading(true);
    await createReferralCode();
    setLoading(false);
  };

  useEffect(() => {
    if (user && session?.access_token) {
      console.log('useReferrals effect triggered for user:', user.email);
      setLoading(true);
      Promise.all([fetchReferralStats(), fetchReferrals()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, session?.access_token]);

  return {
    stats,
    referrals,
    loading,
    sendInvitations,
    getReferralUrl,
    manualGenerateCode,
    refetch: () => {
      fetchReferralStats();
      fetchReferrals();
    }
  };
};
