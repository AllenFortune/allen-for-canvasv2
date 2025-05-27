
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CanvasUser {
  id: number;
  name: string;
  email: string;
}

interface CanvasConnectionTestProps {
  canvasUrl: string;
  apiToken: string;
  testLoading: boolean;
  setTestLoading: (loading: boolean) => void;
  setConnectionStatus: (status: { connected: boolean; user?: CanvasUser }) => void;
  setCanvasUrl: (url: string) => void;
}

const CanvasConnectionTest = ({
  canvasUrl,
  apiToken,
  testLoading,
  setTestLoading,
  setConnectionStatus,
  setCanvasUrl,
}: CanvasConnectionTestProps) => {
  const { toast } = useToast();

  const testCanvasConnection = async (showToast = true) => {
    if (!canvasUrl || !apiToken) {
      if (showToast) {
        toast({
          title: 'Missing Information',
          description: 'Please enter both Canvas URL and API token to test the connection.',
          variant: 'destructive',
        });
      }
      return;
    }

    setTestLoading(true);
    try {
      // Clean URL - remove trailing slash and ensure proper format
      let cleanUrl = canvasUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      cleanUrl = cleanUrl.replace(/\/$/, '');
      
      console.log(`Testing Canvas connection through edge function`);

      // Call our Supabase Edge Function instead of making direct API call
      const { data, error } = await supabase.functions.invoke('test-canvas-connection', {
        body: {
          canvasUrl: cleanUrl,
          canvasToken: apiToken,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to test Canvas connection');
      }

      if (!data.success) {
        throw new Error(data.error || 'Canvas connection test failed');
      }

      setConnectionStatus({
        connected: true,
        user: data.user,
      });

      // Update the URL state with the cleaned version
      if (canvasUrl !== cleanUrl) {
        setCanvasUrl(cleanUrl);
      }

      if (showToast) {
        toast({
          title: 'Connection Successful!',
          description: `Connected to Canvas as ${data.user.name}`,
        });
      }
    } catch (error) {
      console.error('Canvas connection test failed:', error);
      setConnectionStatus({ connected: false });
      
      if (showToast) {
        toast({
          title: 'Connection Failed',
          description: error instanceof Error ? error.message : 'Unable to connect to Canvas. Please check your URL and API token.',
          variant: 'destructive',
        });
      }
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={() => testCanvasConnection()}
      disabled={testLoading || !canvasUrl || !apiToken}
    >
      {testLoading ? 'Testing...' : 'Test Connection'}
    </Button>
  );
};

export default CanvasConnectionTest;
