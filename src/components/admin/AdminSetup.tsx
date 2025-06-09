
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Shield, Check } from 'lucide-react';

const AdminSetup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
      // Insert admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      setIsAdmin(true);
      toast({
        title: "Success",
        description: "Admin role has been set up successfully!",
      });
    } catch (error) {
      console.error('Error setting up admin role:', error);
      toast({
        title: "Error",
        description: "Failed to set up admin role. You may already be an admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'support@allengradeassist.com') {
    return null;
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
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">
                Set up admin access for support@allengradeassist.com
              </p>
              <Button 
                onClick={setupAdminRole} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up...' : 'Setup Admin Role'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
