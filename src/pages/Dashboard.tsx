
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

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
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h1>
              <p className="text-xl text-gray-600">
                Hello {user?.email}! Your Canvas integration and grading dashboard.
              </p>
            </div>
            
            {/* Canvas Connection Status */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isCanvasConnected ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Canvas Integration
                      </h3>
                      <p className="text-gray-600">
                        {isCanvasConnected 
                          ? `Connected to ${profile.canvas_instance_url}`
                          : 'Connect your Canvas account to start using A.L.L.E.N.'
                        }
                      </p>
                    </div>
                  </div>
                  {!isCanvasConnected && (
                    <Link to="/canvas-setup">
                      <Button>
                        Setup Canvas
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Canvas Setup</h3>
                <p className="text-gray-600 mb-4">
                  {isCanvasConnected 
                    ? 'Update your Canvas connection settings.'
                    : 'Connect your Canvas instance to start using A.L.L.E.N.'
                  }
                </p>
                <Link to="/canvas-setup">
                  <Button variant="outline" size="sm">
                    {isCanvasConnected ? 'Update Settings' : 'Setup Canvas'} →
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Grading</h3>
                <p className="text-gray-600 mb-4">Grade assignments with AI assistance.</p>
                <Button variant="outline" size="sm" disabled={!isCanvasConnected}>
                  {isCanvasConnected ? 'Start Grading' : 'Connect Canvas First'}
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync Grades</h3>
                <p className="text-gray-600 mb-4">Push grades and feedback back to Canvas.</p>
                <Button variant="outline" size="sm" disabled={!isCanvasConnected}>
                  {isCanvasConnected ? 'Sync Grades' : 'Connect Canvas First'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
