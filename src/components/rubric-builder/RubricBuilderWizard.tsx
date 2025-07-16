
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ContentInputStep from './steps/ContentInputStep';
import RubricOptionsStep from './steps/RubricOptionsStep';
import RubricPreviewStep from './steps/RubricPreviewStep';
import RubricLibraryStep from './steps/RubricLibraryStep';
import { RubricData, RubricBuilderState } from '@/types/rubric';

const STEPS = [
  { id: 'input', title: 'Content Input', description: 'Provide assignment content' },
  { id: 'options', title: 'Rubric Options', description: 'Configure rubric settings' },
  { id: 'preview', title: 'Preview & Edit', description: 'Review and customize rubric' },
  { id: 'library', title: 'Save & Export', description: 'Save to library or export to Canvas' },
];

const RubricBuilderWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<RubricBuilderState>({
    inputMethod: 'canvas',
    assignmentContent: '',
    selectedAssignment: null,
    rubricType: 'analytic',
    pointsPossible: 100,
    includeDiverAlignment: false,
    subjectArea: '',
    gradeLevel: '',
    customSubject: '',
    isCustomSubject: false,
    generatedRubric: null,
    isGenerating: false,
    error: null,
    rubricTitle: 'Assignment Rubric'
  });

  const updateState = (updates: Partial<RubricBuilderState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Auto-generate rubric title when assignment changes
      if (updates.selectedAssignment || updates.inputMethod) {
        if (newState.selectedAssignment?.title) {
          newState.rubricTitle = `${newState.selectedAssignment.title} Rubric`;
        } else {
          newState.rubricTitle = 'Assignment Rubric';
        }
      }
      
      return newState;
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContentInputStep 
            state={state} 
            updateState={updateState} 
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <RubricOptionsStep 
            state={state} 
            updateState={updateState} 
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <RubricPreviewStep 
            state={state} 
            updateState={updateState} 
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 3:
        return (
          <RubricLibraryStep 
            state={state} 
            updateState={updateState} 
            onPrevious={prevStep}
            onRestart={() => setCurrentStep(0)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-2">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full ${
                index <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  );
};

export default RubricBuilderWizard;
