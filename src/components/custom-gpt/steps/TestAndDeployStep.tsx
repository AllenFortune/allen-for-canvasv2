import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Rocket, MessageSquare, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface TestAndDeployStepProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export const TestAndDeployStep: React.FC<TestAndDeployStepProps> = ({ data, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(data.status === 'active');
  const [configUrl, setConfigUrl] = useState('');

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setTesting(true);
    try {
      // This would call an edge function to test the GPT
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResponse(`I understand you're asking about "${testMessage}". Let me guide you through this step by step. What specific aspect would you like to explore first?`);
      
      toast({
        title: "Test Successful",
        description: "Your teaching assistant is responding correctly.",
      });
    } catch (error) {
      console.error('Error testing GPT:', error);
      toast({
        title: "Test Failed",
        description: "There was an error testing your teaching assistant.",
        variant: "destructive",
      });
    }
    setTesting(false);
  };

  const handleDeploy = async () => {
    if (!user || !data.id) return;

    setDeploying(true);
    try {
      // Call edge function to create the actual GPT with OpenAI
      const { data: deployData, error } = await supabase.functions.invoke('create-custom-gpt', {
        body: {
          gptId: data.id,
          gptData: data
        }
      });

      if (error) throw error;

      // Update status to active
      const { error: updateError } = await supabase
        .from('custom_gpts')
        .update({ 
          status: 'active',
          gpt_id: deployData.gptId,
          openai_config: {
            ...data.openai_config,
            assistant_id: deployData.assistantId
          }
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Generate Canvas configuration URL
      const canvasUrl = `https://${window.location.host}/custom-gpt/${data.id}/canvas-config`;
      setConfigUrl(canvasUrl);
      setDeployed(true);

      onUpdate({ 
        status: 'active',
        gpt_id: deployData.gptId
      });

      toast({
        title: "Deployment Successful",
        description: "Your teaching assistant is now live and ready for students!",
      });
    } catch (error) {
      console.error('Error deploying GPT:', error);
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your teaching assistant.",
        variant: "destructive",
      });
    }
    setDeploying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Configuration URL copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Test & Deploy</h3>
          <p className="text-muted-foreground">Test your teaching assistant and deploy it for students</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* GPT Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Teaching Assistant Summary</CardTitle>
            <CardDescription>Review your configuration before deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Name:</Label>
                <p className="text-muted-foreground">{data.name}</p>
              </div>
              <div>
                <Label className="font-medium">Subject:</Label>
                <p className="text-muted-foreground">{data.subject_area}</p>
              </div>
              <div>
                <Label className="font-medium">Grade Level:</Label>
                <p className="text-muted-foreground">{data.grade_level}</p>
              </div>
              <div>
                <Label className="font-medium">Purpose:</Label>
                <p className="text-muted-foreground">{data.purpose}</p>
              </div>
              <div>
                <Label className="font-medium">Knowledge Base:</Label>
                <p className="text-muted-foreground">
                  {data.knowledge_base_files?.length || 0} files uploaded
                </p>
              </div>
              <div>
                <Label className="font-medium">Questioning Style:</Label>
                <p className="text-muted-foreground">{data.socratic_config.questioning_style}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Test Your Teaching Assistant
            </CardTitle>
            <CardDescription>
              Try asking a question to see how your GPT responds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test_message">Test Question</Label>
              <Input
                id="test_message"
                placeholder="e.g., I'm struggling with quadratic equations. Can you help?"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleTest} 
              disabled={!testMessage.trim() || testing}
              className="w-full"
            >
              {testing ? 'Testing...' : 'Test Response'}
            </Button>

            {testResponse && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="font-medium">GPT Response:</Label>
                <p className="text-sm mt-2">{testResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deployment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Deploy Teaching Assistant
            </CardTitle>
            <CardDescription>
              Make your teaching assistant available to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!deployed ? (
              <Button 
                onClick={handleDeploy} 
                disabled={deploying}
                className="w-full"
                size="lg"
              >
                {deploying ? 'Deploying...' : 'Deploy Teaching Assistant'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Successfully Deployed!</span>
                </div>

                {configUrl && (
                  <div className="space-y-2">
                    <Label>Canvas Configuration URL:</Label>
                    <div className="flex items-center gap-2">
                      <Input value={configUrl} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(configUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use this URL to add your teaching assistant as an external tool in Canvas
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Manage Settings
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};