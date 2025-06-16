
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface CanvasIntegrationCardProps {
  profile?: {
    canvas_instance_url?: string;
    canvas_access_token?: string;
  };
}

const CanvasIntegrationCard: React.FC<CanvasIntegrationCardProps> = ({ profile }) => {
  const { user } = useAuth();
  const [canvasUrl, setCanvasUrl] = useState('');
  const [canvasToken, setCanvasToken] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (profile) {
      setCanvasUrl(profile.canvas_instance_url || '');
      setCanvasToken(profile.canvas_access_token || '');
    }
  }, [profile]);

  useEffect(() => {
    setHasChanges(
      canvasUrl !== (profile?.canvas_instance_url || '') ||
      canvasToken !== (profile?.canvas_access_token || '')
    );
  }, [canvasUrl, canvasToken, profile?.canvas_instance_url, profile?.canvas_access_token]);

  const handleCanvasUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasUrl(e.target.value);
  };

  const handleCanvasTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasToken(e.target.value);
  };

  const handleTestConnection = async () => {
    if (!canvasUrl || !canvasToken) {
      toast({
        title: "Error",
        description: "Please fill in both Canvas URL and Access Token",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-canvas-connection', {
        body: {
          canvasUrl: canvasUrl,
          canvasToken: canvasToken,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Success",
          description: "Connection to Canvas successful!",
        });
      } else {
        throw new Error(data?.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing Canvas connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test Canvas connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!canvasUrl || !canvasToken) {
      toast({
        title: "Error",
        description: "Please fill in both Canvas URL and Access Token",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Test the connection first
      const { data: testData, error: testError } = await supabase.functions.invoke('test-canvas-connection', {
        body: {
          canvasUrl: canvasUrl,
          canvasToken: canvasToken,
        },
      });

      if (testError || !testData.success) {
        throw new Error(testData?.error || 'Connection test failed');
      }

      // Save the credentials
      const { error: saveError } = await supabase
        .from('profiles')
        .update({
          canvas_instance_url: canvasUrl,
          canvas_access_token: canvasToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (saveError) throw saveError;

      // Check for referral rewards (new Canvas connection)
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          await supabase.functions.invoke('check-canvas-connection-rewards', {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });
        }
      } catch (rewardError) {
        console.error('Error checking referral rewards:', rewardError);
        // Don't fail the save if reward processing fails
      }

      toast({
        title: "Success",
        description: "Canvas integration saved successfully!",
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving Canvas integration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Canvas integration",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Canvas Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="canvas-url">Canvas Instance URL</Label>
          <Input
            id="canvas-url"
            type="url"
            placeholder="https://your-canvas-domain.com"
            value={canvasUrl}
            onChange={handleCanvasUrlChange}
          />
        </div>
        <div>
          <Label htmlFor="canvas-token">Canvas Access Token</Label>
          <Input
            id="canvas-token"
            type="password"
            value={canvasToken}
            onChange={handleCanvasTokenChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            <Link to="https://community.canvaslms.com/t5/Admin-Guide/How-do-I-generate-a-developer-access-token-for-an-account/ta-p/89" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
              How to generate a Canvas access token <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleTestConnection} 
            disabled={testing || !canvasUrl || !canvasToken}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || testing || !canvasUrl || !canvasToken}
          >
            Save Integration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasIntegrationCard;
