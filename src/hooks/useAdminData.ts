
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

export const useAdminData = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

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

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
      fetchUserList();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    loading,
    stats,
    users,
    fetchAdminStats,
    fetchUserList,
    sendCanvasSetupEmail
  };
};
