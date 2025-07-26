import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StepWizard from '@/components/ai-assignment/StepWizard';
import { GPTSetupStep } from './steps/GPTSetupStep';
import { KnowledgeBaseStep } from './steps/KnowledgeBaseStep';
import { BehaviorConfigStep } from './steps/BehaviorConfigStep';
import { CanvasIntegrationStep } from './steps/CanvasIntegrationStep';
import { TestAndDeployStep } from './steps/TestAndDeployStep';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomGPTData {
  id?: string;
  name: string;
  description: string;
  subject_area: string;
  grade_level: string;
  purpose: string;
  socratic_config: {
    questioning_style: string;
    guidance_level: string;
    response_length: string;
    encouragement_style: string;
  };
  knowledge_base_files: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  canvas_config: {
    external_tool_name: string;
    description: string;
    privacy_level: string;
  };
  openai_config: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
}

const steps = [
  {
    id: 'setup',
    title: 'GPT Setup',
    description: 'Basic configuration and purpose'
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Upload course materials'
  },
  {
    id: 'behavior',
    title: 'Teaching Behavior',
    description: 'Configure Socratic questioning'
  },
  {
    id: 'canvas',
    title: 'Canvas Integration',
    description: 'External tool setup'
  },
  {
    id: 'deploy',
    title: 'Test & Deploy',
    description: 'Preview and activate'
  }
];

export const CustomGPTBuilderWizard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState('setup');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [gptData, setGptData] = useState<CustomGPTData>({
    name: '',
    description: '',
    subject_area: '',
    grade_level: '',
    purpose: '',
    socratic_config: {
      questioning_style: 'guided',
      guidance_level: 'moderate',
      response_length: 'medium',
      encouragement_style: 'supportive'
    },
    knowledge_base_files: [],
    canvas_config: {
      external_tool_name: '',
      description: '',
      privacy_level: 'public'
    },
    openai_config: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000
    }
  });

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  const updateGPTData = (updates: Partial<CustomGPTData>) => {
    setGptData(prev => ({ ...prev, ...updates }));
  };

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleNext = async () => {
    markStepComplete(currentStep);
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const saveProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const saveData = {
        user_id: user.id,
        name: gptData.name,
        description: gptData.description,
        subject_area: gptData.subject_area,
        grade_level: gptData.grade_level,
        purpose: gptData.purpose,
        socratic_config: gptData.socratic_config,
        knowledge_base_files: gptData.knowledge_base_files,
        canvas_config: gptData.canvas_config,
        openai_config: gptData.openai_config,
        status: 'draft'
      };

      if (gptData.id) {
        const { error } = await supabase
          .from('custom_gpts')
          .update(saveData)
          .eq('id', gptData.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('custom_gpts')
          .insert(saveData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setGptData(prev => ({ ...prev, id: data.id }));
        }
      }

      toast({
        title: "Progress Saved",
        description: "Your CustomGPT configuration has been saved.",
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <GPTSetupStep
            data={gptData}
            onUpdate={updateGPTData}
            onNext={handleNext}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeBaseStep
            data={gptData}
            onUpdate={updateGPTData}
            onNext={handleNext}
          />
        );
      case 'behavior':
        return (
          <BehaviorConfigStep
            data={gptData}
            onUpdate={updateGPTData}
            onNext={handleNext}
          />
        );
      case 'canvas':
        return (
          <CanvasIntegrationStep
            data={gptData}
            onUpdate={updateGPTData}
            onNext={handleNext}
          />
        );
      case 'deploy':
        return (
          <TestAndDeployStep
            data={gptData}
            onUpdate={updateGPTData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Teaching Assistant</CardTitle>
          <CardDescription>
            Follow the steps below to build and deploy your custom GPT teaching assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          >
            <div className="mt-8">
              {renderStepContent()}
            </div>
          </StepWizard>

          {/* Navigation and Save */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={saveProgress}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Progress'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};