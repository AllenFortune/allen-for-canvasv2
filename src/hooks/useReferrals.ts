
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
    if (!user?.email) return;

    try {
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        user_email_param: user.email
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      } else {
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
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referee_email, status, canvas_connected_at, rewards_granted_at, created_at')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const createReferralCode = async () => {
    if (!user?.email || !user?.id) return;

    try {
      const { data: code, error: codeError } = await supabase.rpc('generate_referral_code', {
        user_email: user.email
      });

      if (codeError) throw codeError;

      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referrer_email: user.email,
          referral_code: code,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Refresh stats
      await fetchReferralStats();
    } catch (error) {
      console.error('Error creating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to create referral code",
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

  useEffect(() => {
    if (user && session?.access_token) {
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
    refetch: () => {
      fetchReferralStats();
      fetchReferrals();
    }
  };
};
