
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Shield, Check, AlertCircle } from 'lucide-react';

const AdminSetup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setCheckingStatus(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.id, user.email);
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin status:', error);
        throw error;
      }

      console.log('Admin status check result:', data);
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const setupAdminRole = async () => {
    if (!user?.id || user.email !== 'support@allengradeassist.com') {
      toast({
        title: "Access Denied",
        description: "Only support@allengradeassist.com can be set as admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Setting up admin role for user:', user.id, user.email);
      
      // Insert admin role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })
        .select();

      if (error) {
        console.error('Database error during admin setup:', error);
        throw error;
      }

      console.log('Admin role inserted successfully:', data);
      setIsAdmin(true);
      
      toast({
        title: "Success",
        description: "Admin role has been set up successfully!",
      });

      // Re-check admin status to confirm
      setTimeout(() => {
        checkAdminStatus();
      }, 1000);
      
    } catch (error) {
      console.error('Error setting up admin role:', error);
      
      let errorMessage = "Failed to set up admin role.";
      if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'support@allengradeassist.com') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Admin setup is only available for support@allengradeassist.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingStatus) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking admin status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Admin role is set up!</p>
              <p className="text-sm text-gray-600 mt-2">
                You can now access the admin portal.
              </p>
              <Button 
                onClick={() => window.location.href = '/admin-portal'} 
                className="w-full mt-4"
              >
                Go to Admin Portal
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">
                Set up admin access for {user.email}
              </p>
              <Button 
                onClick={setupAdminRole} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up...' : 'Setup Admin Role'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Check the browser console for detailed logs
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
