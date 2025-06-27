
import React from 'react';
import AssessmentTypeToggle from './AssessmentTypeToggle';
import RubricToggle from './RubricToggle';
import CustomPromptToggle from './CustomPromptToggle';
import { Assignment } from '@/types/grading';

interface AIGradingSectionProps {
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
  useRubricForAI: boolean;
  setUseRubricForAI: (value: boolean) => void;
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  assignment: Assignment | null;
}

const AIGradingSection: React.FC<AIGradingSectionProps> = ({
  isSummativeAssessment,
  setIsSummativeAssessment,
  useRubricForAI,
  setUseRubricForAI,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  assignment
}) => {
  const hasRubric = assignment?.rubric && Object.keys(assignment.rubric).length > 0;

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
      <AssessmentTypeToggle
        isSummativeAssessment={isSummativeAssessment}
        setIsSummativeAssessment={setIsSummativeAssessment}
      />
      
      <RubricToggle
        useRubricForAI={useRubricForAI}
        setUseRubricForAI={setUseRubricForAI}
        hasRubric={hasRubric}
      />

      <CustomPromptToggle
        useCustomPrompt={useCustomPrompt}
        setUseCustomPrompt={setUseCustomPrompt}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
      />
    </div>
  );
};

export default AIGradingSection;
