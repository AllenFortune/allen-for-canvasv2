
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Users, Settings, ArrowRight } from 'lucide-react';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
                      <p className="text-green-600 text-sm">Logged in as:</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Courses Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Courses</h3>
                <p className="text-gray-600 mb-6">Manage your Canvas courses</p>
                <Link to="/courses">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    View Courses <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* Settings Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
                <p className="text-gray-600 mb-6">Manage your account and Canvas integration</p>
                <Link to="/settings">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    View Settings <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* Needs Grading Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Needs Grading</h3>
                <p className="text-gray-600 mb-6">View all assignments that need grading</p>
                <Link to="/assignments">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={!isCanvasConnected}>
                    View Assignments <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
