
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

const CanvasSetup = () => {
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!canvasUrl || !apiToken) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Canvas URL and API token.',
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
        title: 'Connection Failed',
        description: 'Failed to save Canvas settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving Canvas settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!canvasUrl || !apiToken) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Canvas URL and API token to test the connection.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Basic validation of Canvas URL format
      const url = new URL(canvasUrl);
      if (!url.hostname.includes('instructure.com') && !url.hostname.includes('canvas')) {
        throw new Error('Invalid Canvas URL format');
      }

      toast({
        title: 'Connection Test',
        description: 'Canvas URL format looks valid. Click Save & Continue to proceed.',
      });
    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Canvas URL (e.g., https://university.instructure.com)',
        variant: 'destructive',
      });
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

              <div className="space-y-6">
                <div>
                  <Label htmlFor="canvasUrl" className="text-base font-medium text-gray-900">Canvas URL</Label>
                  <Input
                    id="canvasUrl"
                    type="url"
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
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
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Canvas API token"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste your Canvas API token here
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">How to generate a Canvas API token:</h3>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Log in to your Canvas account</li>
                    <li>2. Click on your profile picture in the top right corner</li>
                    <li>3. Select "Settings" from the dropdown menu</li>
                    <li>4. Scroll down to the "Approved Integrations" section</li>
                    <li>5. Click the "+ New Access Token" button</li>
                    <li>6. Enter <strong>Canvas Grading Assistant</strong> as the Purpose</li>
                    <li>7. Optionally set an expiration date (we recommend at least 1 year)</li>
                    <li>8. Click "Generate Token"</li>
                    <li>9. Copy the generated token and paste it in the field above</li>
                  </ol>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.open(`${canvasUrl}/profile/settings`, '_blank')}
                    disabled={!canvasUrl}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Canvas Settings
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Grading Setup (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To use AI-assisted grading, you'll need to set up an OpenAI API key in your environment variables.
                  </p>
                  <p className="text-sm text-gray-600">
                    Add <code className="bg-white px-2 py-1 rounded text-xs">OPENAI_API_KEY</code> to your environment variables with your OpenAI API key.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="sm:order-1"
                  >
                    Skip for now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={loading || !canvasUrl || !apiToken}
                    className="sm:order-2"
                  >
                    Test Connection
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !canvasUrl || !apiToken}
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
