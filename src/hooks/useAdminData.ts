import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AdminUserStats {
  total_users: number;
  canvas_connected: number;
  canvas_not_connected: number;
  recent_signups: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  school_name: string;
  canvas_connected: boolean;
  created_at: string;
  last_usage_date: string;
  total_submissions: number;
  subscription_tier: string;
  subscription_status: string;
  current_month_submissions: number;
  purchased_submissions: number;
  subscription_limit: number;
}

interface RevenueStats {
  current_month_mrr: number;
  previous_month_mrr: number;
  growth_percentage: number;
  current_month_name: string;
  previous_month_name: string;
}

interface WeeklyStats {
  current_week_new_mrr: number;
  previous_week_new_mrr: number;
  week_growth_percentage: number;
  new_subscribers_this_week: number;
  churned_this_week: number;
}

export const useAdminData = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.rpc('get_admin_user_stats');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user statistics",
        variant: "destructive",
      });
    }
  };

  const fetchUserList = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.rpc('get_admin_user_list');
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching user list:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user list",
        variant: "destructive",
      });
    }
  };

  const fetchRevenueStats = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.rpc('get_monthly_revenue_stats');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setRevenueStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch revenue statistics",
        variant: "destructive",
      });
    }
  };

  const fetchWeeklyStats = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.rpc('get_weekly_revenue_trend');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setWeeklyStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weekly statistics",
        variant: "destructive",
      });
    }
  };

  const sendCanvasSetupEmail = async (userEmail: string, userName: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-canvas-setup-email', {
        body: { 
          userEmail, 
          userName,
          adminEmail: user?.email 
        }
      });

      if (error) throw error;

      // Log the email campaign
      await supabase.from('admin_email_campaigns').insert({
        campaign_name: 'Canvas Setup Reminder',
        email_type: 'canvas_setup',
        sent_to_email: userEmail,
        sent_by_admin_email: user?.email || '',
        template_used: 'canvas_setup_reminder'
      });

      toast({
        title: "Email Sent",
        description: `Canvas setup email sent to ${userEmail}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const pauseAccount = async (userEmail: string, reason?: string) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform admin actions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-pause-account', {
        body: { userEmail, reason },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account Paused",
        description: `Account for ${userEmail} has been paused successfully`,
        variant: "default",
      });

      // Refresh the user list
      await fetchUserList();
    } catch (error) {
      console.error('Error pausing account:', error);
      toast({
        title: "Error",
        description: "Failed to pause account",
        variant: "destructive",
      });
    }
  };

  const resumeAccount = async (userEmail: string, reason?: string) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform admin actions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-resume-account', {
        body: { userEmail, reason },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account Resumed",
        description: `Account for ${userEmail} has been resumed successfully`,
        variant: "default",
      });

      // Refresh the user list
      await fetchUserList();
    } catch (error) {
      console.error('Error resuming account:', error);
      toast({
        title: "Error",
        description: "Failed to resume account",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async (userEmail: string, reason?: string) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform admin actions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-delete-account', {
        body: { userEmail, reason },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: `Account for ${userEmail} has been permanently deleted`,
        variant: "default",
      });

      // Refresh the user list
      await fetchUserList();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
      fetchUserList();
      fetchRevenueStats();
      fetchWeeklyStats();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    loading,
    stats,
    users,
    revenueStats,
    weeklyStats,
    fetchAdminStats,
    fetchUserList,
    fetchRevenueStats,
    fetchWeeklyStats,
    sendCanvasSetupEmail,
    pauseAccount,
    resumeAccount,
    deleteAccount
  };
};