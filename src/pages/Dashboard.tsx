
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubmissionPurchaseCard from "@/components/dashboard/SubmissionPurchaseCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Users, Settings, ArrowRight, BookText } from 'lucide-react';

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
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
              <p className="text-xl text-gray-600">
                Welcome to your Canvas Grading Assistant dashboard!
              </p>
            </div>
            
            {/* Canvas Connection Status */}
            {isCanvasConnected && (
              <div className="mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-green-800 font-medium">
                        Connected to Canvas: {profile.canvas_instance_url}
                      </p>
                      {canvasUser ? (
                        <p className="text-green-600 text-sm">
                          Logged in as: <strong>{canvasUser.name}</strong> ({canvasUser.email})
                        </p>
                      ) : (
                        <p className="text-green-600 text-sm">Logged in as: Canvas User</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Promotion Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 rounded-full p-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Invite Friends & Earn Rewards</h3>
                      <p className="text-gray-600">Get 10 free submissions for each friend who connects Canvas</p>
                    </div>
                  </div>
                  <Link to="/settings?tab=referrals">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Start Referring <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dashboard Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Courses Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Courses</h3>
                <p className="text-gray-600 mb-6 flex-grow">Manage your Canvas courses</p>
                <Link to="/courses">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    View Courses <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* Needs Grading Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Needs Grading</h3>
                <p className="text-gray-600 mb-6 flex-grow">View all assignments that need grading</p>
                <Link to="/assignments">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={!isCanvasConnected}>
                    View Assignments <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* AI Literacy Assignment Integration Tool Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
                <div className="flex items-center mb-2">
                  <BookText className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">AI Literacy Tool</h3>
                </div>
                <p className="text-gray-600 mb-6 flex-grow">Transform assignments with DIVER framework AI integration</p>
                <Link to="/ai-assignment-integration">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Launch Tool <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* Settings Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
                <p className="text-gray-600 mb-6 flex-grow">Manage your account and Canvas integration</p>
                <Link to="/settings">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    View Settings <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

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
