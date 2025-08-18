
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubmissionPurchaseCard from "@/components/dashboard/SubmissionPurchaseCard";
import CanvasConnectionDisplay from "@/components/dashboard/CanvasConnectionDisplay";
import ReferralPromotionSection from "@/components/dashboard/ReferralPromotionSection";
import DashboardCardsGrid from "@/components/dashboard/DashboardCardsGrid";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
}

interface CanvasUser {
  id: number;
  name: string;
  email: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [canvasUser, setCanvasUser] = useState<CanvasUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Validate session health before making other API calls
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log('No valid session found, refreshing...');
          await supabase.auth.refreshSession();
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('canvas_instance_url, canvas_access_token, school_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);

        // If we have Canvas credentials, test the connection to get user info
        if (data.canvas_instance_url && data.canvas_access_token) {
          await fetchCanvasUser(data.canvas_instance_url, data.canvas_access_token);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchCanvasUser = async (canvasUrl: string, canvasToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('test-canvas-connection', {
        body: {
          canvasUrl: canvasUrl,
          canvasToken: canvasToken,
        },
      });

      if (error) {
        console.error('Error fetching Canvas user:', error);
        return;
      }

      if (data.success && data.user) {
        setCanvasUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching Canvas user:', error);
    }
  };

  const isCanvasConnected = profile?.canvas_instance_url && profile?.canvas_access_token;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <DashboardHeader />
            
            <CanvasConnectionDisplay profile={profile} canvasUser={canvasUser} />

            <ReferralPromotionSection />
            
            <DashboardCardsGrid isCanvasConnected={!!isCanvasConnected} />

            {/* Billing Period Usage Section */}
            <div className="mb-8">
              <SubmissionPurchaseCard />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
