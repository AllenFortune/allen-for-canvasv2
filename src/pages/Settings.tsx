
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from '@/components/settings/ProfileCard';
import CanvasIntegrationCard from '@/components/settings/CanvasIntegrationCard';
import SubscriptionCard from '@/components/settings/SubscriptionCard';
import AccountActionsCard from '@/components/settings/AccountActionsCard';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
  email?: string;
  full_name?: string;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-xl text-gray-600">Manage your account, Canvas integration, and referrals</p>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <ProfileCard loading={loading} profile={profile} user={user} />
                <CanvasIntegrationCard profile={profile} />
                <AccountActionsCard onSignOut={handleSignOut} />
              </TabsContent>
              
              <TabsContent value="subscription" className="space-y-6">
                <SubscriptionCard />
              </TabsContent>
              
              <TabsContent value="referrals" className="space-y-6">
                <ReferralDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
