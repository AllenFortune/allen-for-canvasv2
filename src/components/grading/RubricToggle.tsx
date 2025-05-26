
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface RubricToggleProps {
  useRubricForAI: boolean;
  setUseRubricForAI: (value: boolean) => void;
  hasRubric: boolean;
}

const RubricToggle: React.FC<RubricToggleProps> = ({
  useRubricForAI,
  setUseRubricForAI,
  hasRubric
}) => {
  if (!hasRubric) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Grading Criteria
          </label>
          <p className="text-xs text-gray-500">
            {useRubricForAI 
              ? "AI will use the assignment rubric for grading" 
              : "AI will use the assignment description for grading"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Description</span>
          <Switch
            checked={useRubricForAI}
            onCheckedChange={setUseRubricForAI}
          />
          <span className="text-xs text-gray-600">Rubric</span>
        </div>
      </div>
    </div>
  );
};

export default RubricToggle;
