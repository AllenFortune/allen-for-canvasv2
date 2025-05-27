
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import CanvasDisclaimer from '@/components/canvas-setup/CanvasDisclaimer';
import CanvasConnectionStatus from '@/components/canvas-setup/CanvasConnectionStatus';
import CanvasTokenInstructions from '@/components/canvas-setup/CanvasTokenInstructions';
import CanvasConnectionTest from '@/components/canvas-setup/CanvasConnectionTest';

interface CanvasUser {
  id: number;
  name: string;
  email: string;
}

const CanvasSetup = () => {
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    user?: CanvasUser;
  }>({ connected: false });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load existing Canvas settings
  useEffect(() => {
    const loadCanvasSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('canvas_instance_url, canvas_access_token')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data.canvas_instance_url) {
          setCanvasUrl(data.canvas_instance_url);
        }
        if (data.canvas_access_token) {
          setApiToken(data.canvas_access_token);
          // Test existing connection
          if (data.canvas_instance_url && data.canvas_access_token) {
            testCanvasConnection(data.canvas_instance_url, data.canvas_access_token);
          }
        }
      } catch (error) {
        console.error('Error loading Canvas settings:', error);
      }
    };

    loadCanvasSettings();
  }, [user]);

  const testCanvasConnection = async (testUrl?: string, testToken?: string) => {
    const urlToTest = testUrl || canvasUrl;
    const tokenToTest = testToken || apiToken;

    if (!urlToTest || !tokenToTest) return;

    setTestLoading(true);
    try {
      let cleanUrl = urlToTest.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      cleanUrl = cleanUrl.replace(/\/$/, '');
      
      const { data, error } = await supabase.functions.invoke('test-canvas-connection', {
        body: {
          canvasUrl: cleanUrl,
          canvasToken: tokenToTest,
        },
      });

      if (error) throw new Error(error.message || 'Failed to test Canvas connection');
      if (!data.success) throw new Error(data.error || 'Canvas connection test failed');

      setConnectionStatus({
        connected: true,
        user: data.user,
      });

      if (testUrl !== cleanUrl) {
        setCanvasUrl(cleanUrl);
      }
    } catch (error) {
      console.error('Canvas connection test failed:', error);
      setConnectionStatus({ connected: false });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canvasUrl || !apiToken) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Canvas URL and API token.',
        variant: 'destructive',
      });
      return;
    }

    if (!connectionStatus.connected) {
      toast({
        title: 'Connection Not Verified',
        description: 'Please test your connection first to ensure the settings are correct.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          canvas_instance_url: canvasUrl,
          canvas_access_token: apiToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Canvas Connected!',
        description: 'Your Canvas account has been successfully connected.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save Canvas settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving Canvas settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Canvas Integration</h1>
                <p className="text-gray-600">Connect your Canvas account to enable AI-assisted grading</p>
              </div>

              <CanvasDisclaimer />

              <div className="space-y-6">
                <div>
                  <Label htmlFor="canvasUrl" className="text-base font-medium text-gray-900">Canvas URL</Label>
                  <Input
                    id="canvasUrl"
                    type="url"
                    value={canvasUrl}
                    onChange={(e) => {
                      setCanvasUrl(e.target.value);
                      setConnectionStatus({ connected: false });
                    }}
                    placeholder="https://your-school.instructure.com"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your school's Canvas URL (e.g., https://university.instructure.com)
                  </p>
                </div>

                <div>
                  <Label htmlFor="apiToken" className="text-base font-medium text-gray-900">Canvas API Token</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    value={apiToken}
                    onChange={(e) => {
                      setApiToken(e.target.value);
                      setConnectionStatus({ connected: false });
                    }}
                    placeholder="Canvas API token"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste your Canvas API token here
                  </p>
                </div>

                <CanvasConnectionStatus 
                  connectionStatus={connectionStatus} 
                  canvasUrl={canvasUrl} 
                />

                <CanvasTokenInstructions canvasUrl={canvasUrl} />

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="sm:order-1"
                  >
                    Skip for now
                  </Button>
                  <CanvasConnectionTest
                    canvasUrl={canvasUrl}
                    apiToken={apiToken}
                    testLoading={testLoading}
                    setTestLoading={setTestLoading}
                    setConnectionStatus={setConnectionStatus}
                    setCanvasUrl={setCanvasUrl}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={loading || !canvasUrl || !apiToken || !connectionStatus.connected}
                    className="sm:order-3"
                  >
                    {loading ? 'Saving...' : 'Save & Continue'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CanvasSetup;
