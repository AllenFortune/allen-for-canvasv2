
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
              <p className="text-xl text-gray-600">Manage your account and Canvas integration</p>
            </div>

            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{profile?.full_name || user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      {profile?.school_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">School</label>
                          <p className="text-gray-900">{profile.school_name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Canvas Integration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    Canvas Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile?.canvas_instance_url ? (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Connected Canvas Instance</label>
                        <p className="text-gray-900">{profile.canvas_instance_url}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600">No Canvas instance connected</p>
                      </div>
                    )}
                    <Link to="/canvas-setup">
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {profile?.canvas_instance_url ? 'Update' : 'Setup'} Canvas Integration
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Subscription & Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Plan</label>
                      <p className="text-gray-900">Free Trial</p>
                      <p className="text-sm text-gray-600">10 graded submissions remaining</p>
                    </div>
                    
                    {/* Add-on Pack */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-900 mb-2">Add-on Pack</h3>
                      <p className="text-sm text-gray-600 mb-3">Need more graded submissions? Add them to any plan.</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">$4.94</span>
                          <span className="text-gray-500 line-through ml-2">$5.49</span>
                          <span className="text-green-600 text-sm ml-2">10% off</span>
                          <p className="text-sm text-gray-600">100 additional graded submissions</p>
                        </div>
                        <Button className="bg-gray-900 hover:bg-gray-800">
                          Add to Your Plan
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link to="/pricing">
                        <Button variant="outline" className="mr-4">
                          View All Plans
                        </Button>
                      </Link>
                      <Button variant="outline">
                        Billing History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
