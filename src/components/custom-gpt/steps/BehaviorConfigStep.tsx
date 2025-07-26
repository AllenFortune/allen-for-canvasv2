import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Users, MessageCircle, Brain } from 'lucide-react';

interface BehaviorConfigStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export const BehaviorConfigStep: React.FC<BehaviorConfigStepProps> = ({ data, onUpdate, onNext }) => {
  const updateSocraticConfig = (field: string, value: any) => {
    const updatedConfig = {
      ...data.socratic_config,
      [field]: value
    };
    onUpdate({ socratic_config: updatedConfig });
  };

  const updateOpenAIConfig = (field: string, value: any) => {
    const updatedConfig = {
      ...data.openai_config,
      [field]: value
    };
    onUpdate({ openai_config: updatedConfig });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Teaching Behavior Configuration</h3>
          <p className="text-muted-foreground">Configure how your GPT will interact with students</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Socratic Questioning Style
            </CardTitle>
            <CardDescription>
              Configure how your GPT guides students through learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questioning_style">Questioning Approach</Label>
                <Select 
                  onValueChange={(value) => updateSocraticConfig('questioning_style', value)}
                  value={data.socratic_config.questioning_style}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select questioning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guided">Guided Discovery - Step-by-step leading questions</SelectItem>
                    <SelectItem value="open">Open Inquiry - Broad, thought-provoking questions</SelectItem>
                    <SelectItem value="analytical">Analytical - Break down complex problems</SelectItem>
                    <SelectItem value="reflective">Reflective - Encourage self-assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guidance_level">Guidance Level</Label>
                <Select 
                  onValueChange={(value) => updateSocraticConfig('guidance_level', value)}
                  value={data.socratic_config.guidance_level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guidance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal - Let students discover independently</SelectItem>
                    <SelectItem value="moderate">Moderate - Provide hints when needed</SelectItem>
                    <SelectItem value="supportive">Supportive - Guide through each step</SelectItem>
                    <SelectItem value="adaptive">Adaptive - Adjust based on student responses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="response_length">Response Length</Label>
                <Select 
                  onValueChange={(value) => updateSocraticConfig('response_length', value)}
                  value={data.socratic_config.response_length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select response length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief - Concise, focused responses</SelectItem>
                    <SelectItem value="medium">Medium - Balanced explanations</SelectItem>
                    <SelectItem value="detailed">Detailed - Comprehensive guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encouragement_style">Encouragement Style</Label>
                <Select 
                  onValueChange={(value) => updateSocraticConfig('encouragement_style', value)}
                  value={data.socratic_config.encouragement_style}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select encouragement style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supportive">Supportive - Positive reinforcement</SelectItem>
                    <SelectItem value="challenging">Challenging - Push to think deeper</SelectItem>
                    <SelectItem value="neutral">Neutral - Factual, objective tone</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic - Energetic motivation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Custom Instructions (Optional)</Label>
              <Textarea
                placeholder="Add any specific instructions for how your GPT should behave, special considerations for your students, or subject-specific guidance approaches..."
                value={data.socratic_config.custom_instructions || ''}
                onChange={(e) => updateSocraticConfig('custom_instructions', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Model Settings</CardTitle>
            <CardDescription>
              Fine-tune the AI model behavior for optimal teaching performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Creativity Level: {data.openai_config.temperature}</Label>
              <Slider
                value={[data.openai_config.temperature]}
                onValueChange={(value) => updateOpenAIConfig('temperature', value[0])}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Consistent</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Response Length: {data.openai_config.max_tokens} tokens</Label>
              <Slider
                value={[data.openai_config.max_tokens]}
                onValueChange={(value) => updateOpenAIConfig('max_tokens', value[0])}
                max={4000}
                min={100}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Brief</span>
                <span>Detailed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continue to Canvas Integration
        </Button>
      </div>
    </div>
  );
};