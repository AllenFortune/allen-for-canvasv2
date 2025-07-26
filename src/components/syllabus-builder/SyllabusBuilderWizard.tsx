import React, { useState } from 'react';
import StepWizard from "@/components/ai-assignment/StepWizard";
import SyllabusInputStep from "./steps/SyllabusInputStep";
import PolicyOptionsStep from "./steps/PolicyOptionsStep";
import GuideGenerationStep from "./steps/GuideGenerationStep";
import ReviewAndExportStep from "./steps/ReviewAndExportStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: 'upload' | 'paste' | 'canvas';
  fileName?: string;
}

interface PolicyOptions {
  includeAcademicIntegrity: boolean;
  includePermittedUses: boolean;
  includeCitationGuidelines: boolean;
  includeAssignmentSpecific: boolean;
  assignmentSpecificDetails: string;
  policyTone: 'formal' | 'friendly' | 'balanced';
  enforcementLevel: 'strict' | 'moderate' | 'flexible';
}

interface GeneratedContent {
  enhancedSyllabus?: string;
  aiPolicies?: string;
  studentGuide?: string;
  canvasContent?: string;
}

const steps = [
  {
    id: 'input',
    title: 'Input Syllabus',
    description: 'Upload or paste your current syllabus'
  },
  {
    id: 'policies',
    title: 'Policy Options',
    description: 'Customize AI use policies'
  },
  {
    id: 'generation',
    title: 'Generate Content',
    description: 'AI creates your policies and guides'
  },
  {
    id: 'export',
    title: 'Review & Export',
    description: 'Download your enhanced materials'
  }
];

const SyllabusBuilderWizard = () => {
  const [currentStep, setCurrentStep] = useState('input');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [syllabusData, setSyllabusData] = useState<SyllabusData>({
    content: '',
    subject: '',
    gradeLevel: '',
    courseName: '',
    inputMethod: 'paste'
  });
  
  const [policyOptions, setPolicyOptions] = useState<PolicyOptions>({
    includeAcademicIntegrity: true,
    includePermittedUses: true,
    includeCitationGuidelines: true,
    includeAssignmentSpecific: false,
    assignmentSpecificDetails: '',
    policyTone: 'balanced',
    enforcementLevel: 'moderate'
  });
  
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  const handleNext = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-syllabus-content', {
        body: {
          syllabusData: {
            content: syllabusData.content,
            subject: syllabusData.subject,
            gradeLevel: syllabusData.gradeLevel,
            courseName: syllabusData.courseName,
            inputMethod: syllabusData.inputMethod
          },
          policyOptions: {
            academicIntegrity: policyOptions.includeAcademicIntegrity,
            permittedUses: policyOptions.includePermittedUses,
            citationRequirements: policyOptions.includeCitationGuidelines,
            tone: policyOptions.policyTone,
            enforcement: policyOptions.enforcementLevel
          }
        }
      });

      if (error) {
        console.error('Error generating content:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to generate content. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setGeneratedContent({
        enhancedSyllabus: data.enhancedSyllabus,
        aiPolicies: data.aiPolicyDocument,
        studentGuide: data.studentGuide,
        canvasContent: data.canvasResources
      });

      toast({
        title: "Content Generated Successfully",
        description: "Your AI syllabus resources have been generated and are ready for review.",
      });
      handleNext();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Generation Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'input':
        return (
          <SyllabusInputStep
            data={syllabusData}
            onChange={setSyllabusData}
          />
        );
      case 'policies':
        return (
          <PolicyOptionsStep
            options={policyOptions}
            onChange={setPolicyOptions}
            syllabusData={syllabusData}
          />
        );
      case 'generation':
        return (
          <GuideGenerationStep
            syllabusData={syllabusData}
            policyOptions={policyOptions}
            onGenerate={handleGenerateContent}
            loading={loading}
          />
        );
      case 'export':
        return (
          <ReviewAndExportStep
            generatedContent={generatedContent}
            syllabusData={syllabusData}
            policyOptions={policyOptions}
            onContentChange={setGeneratedContent}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'input':
        return syllabusData.content.trim() !== '' && syllabusData.courseName.trim() !== '';
      case 'policies':
        return true;
      case 'generation':
        return Object.keys(generatedContent).length > 0;
      case 'export':
        return false; // No next step
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <StepWizard 
        steps={steps} 
        currentStep={currentStep} 
        completedSteps={completedSteps}
      >
        {renderStepContent()}
      </StepWizard>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep !== 'export' && currentStep !== 'generation' && (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {currentStep === 'generation' && (
          <Button
            onClick={handleGenerateContent}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SyllabusBuilderWizard;