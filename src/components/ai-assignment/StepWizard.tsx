import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  children: React.ReactNode;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  currentStep,
  completedSteps,
  children
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <Card>
      <CardContent className="p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;
              const isReached = index <= currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrent 
                            ? 'bg-primary/20 text-primary border-2 border-primary' 
                            : isReached
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted/50 text-muted-foreground/50'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isReached ? 'bg-primary/30' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Current Step Content */}
        <div className="min-h-[400px]">
          {children}
        </div>
        
        {/* Step Indicator for Mobile */}
        <div className="sm:hidden mt-4 text-center">
          <Badge variant="outline">
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepWizard;