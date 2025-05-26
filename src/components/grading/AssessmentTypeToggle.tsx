
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Target, GraduationCap } from 'lucide-react';

interface AssessmentTypeToggleProps {
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
}

const AssessmentTypeToggle: React.FC<AssessmentTypeToggleProps> = ({
  isSummativeAssessment,
  setIsSummativeAssessment
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Assessment Type
          </label>
          <p className="text-xs text-gray-500">
            {isSummativeAssessment 
              ? "Final evaluation with comprehensive grading and feedback" 
              : "Learning-focused feedback to guide improvement"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Target className="w-3 h-3" />
            <span>Formative</span>
          </div>
          <Switch
            checked={isSummativeAssessment}
            onCheckedChange={setIsSummativeAssessment}
          />
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <GraduationCap className="w-3 h-3" />
            <span>Summative</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTypeToggle;
