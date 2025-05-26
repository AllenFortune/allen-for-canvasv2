
import React from 'react';
import AssessmentTypeToggle from './AssessmentTypeToggle';
import RubricToggle from './RubricToggle';
import { Assignment } from '@/types/grading';

interface AIGradingSectionProps {
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
  useRubricForAI: boolean;
  setUseRubricForAI: (value: boolean) => void;
  assignment: Assignment | null;
}

const AIGradingSection: React.FC<AIGradingSectionProps> = ({
  isSummativeAssessment,
  setIsSummativeAssessment,
  useRubricForAI,
  setUseRubricForAI,
  assignment
}) => {
  const hasRubric = assignment?.rubric && Object.keys(assignment.rubric).length > 0;

  return (
    <div className="space-y-4 p-3 bg-gray-50 rounded-lg border">
      <AssessmentTypeToggle
        isSummativeAssessment={isSummativeAssessment}
        setIsSummativeAssessment={setIsSummativeAssessment}
      />
      
      <RubricToggle
        useRubricForAI={useRubricForAI}
        setUseRubricForAI={setUseRubricForAI}
        hasRubric={hasRubric}
      />
    </div>
  );
};

export default AIGradingSection;
