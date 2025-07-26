import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Shield, Settings } from 'lucide-react';

interface CanvasIntegrationStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export const CanvasIntegrationStep: React.FC<CanvasIntegrationStepProps> = ({ data, onUpdate, onNext }) => {
  const updateCanvasConfig = (field: string, value: any) => {
    const updatedConfig = {
      ...data.canvas_config,
      [field]: value
    };
    onUpdate({ canvas_config: updatedConfig });
  };

  // Auto-populate canvas fields from GPT setup data if they're empty
  useEffect(() => {
    const canvasConfig = data.canvas_config || {};
    
    // Only populate if fields are empty and we have GPT data
    if (data.name && !canvasConfig.external_tool_name) {
      updateCanvasConfig('external_tool_name', data.name);
    }
    
    if (data.description && !canvasConfig.description) {
      updateCanvasConfig('description', data.description);
    }
  }, [data.name, data.description]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <ExternalLink className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Canvas Integration</h3>
          <p className="text-muted-foreground">Configure your GPT as a Canvas external tool for easy student access</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              External Tool Configuration
            </CardTitle>
            <CardDescription>
              Set up how your teaching assistant will appear in Canvas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool_name">Tool Name *</Label>
              <Input
                id="tool_name"
                placeholder="e.g., Math Teaching Assistant"
                value={data.canvas_config.external_tool_name || ''}
                onChange={(e) => updateCanvasConfig('external_tool_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool_description">Tool Description</Label>
              <Input
                id="tool_description"
                placeholder="Short summary of your GPT for Canvas (auto-populated from setup)"
                value={data.canvas_config.description || ''}
                onChange={(e) => updateCanvasConfig('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy_level">Privacy Level</Label>
              <Select 
                onValueChange={(value) => updateCanvasConfig('privacy_level', value)}
                value={data.canvas_config.privacy_level}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Available to all students</SelectItem>
                  <SelectItem value="course">Course Only - Limited to enrolled students</SelectItem>
                  <SelectItem value="private">Private - Require instructor approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access & Security Settings
            </CardTitle>
            <CardDescription>
              Configure how students can access and use your teaching assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Student Identity Verification</Label>
                <div className="text-sm text-muted-foreground">
                  Require Canvas login to access the teaching assistant
                </div>
              </div>
              <Switch
                checked={data.canvas_config.require_canvas_login !== false}
                onCheckedChange={(checked) => updateCanvasConfig('require_canvas_login', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Course Context</Label>
                <div className="text-sm text-muted-foreground">
                  Pass course information to provide context-aware responses
                </div>
              </div>
              <Switch
                checked={data.canvas_config.include_course_context !== false}
                onCheckedChange={(checked) => updateCanvasConfig('include_course_context', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usage Analytics</Label>
                <div className="text-sm text-muted-foreground">
                  Track student interactions for improving teaching effectiveness
                </div>
              </div>
              <Switch
                checked={data.canvas_config.enable_analytics !== false}
                onCheckedChange={(checked) => updateCanvasConfig('enable_analytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Grade Passback</Label>
                <div className="text-sm text-muted-foreground">
                  Allow participation scores to be sent back to Canvas gradebook
                </div>
              </div>
              <Switch
                checked={data.canvas_config.enable_grade_passback === true}
                onCheckedChange={(checked) => updateCanvasConfig('enable_grade_passback', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Canvas Integration Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p className="font-medium">After deployment, follow these steps to add to Canvas:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Navigate to your Canvas course settings</li>
              <li>Go to "Apps" or "External Tools"</li>
              <li>Click "Add App" and select "By URL"</li>
              <li>Use the provided configuration URL from the next step</li>
              <li>Configure placement options (course navigation, assignments, etc.)</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continue to Test & Deploy
        </Button>
      </div>
    </div>
  );
};