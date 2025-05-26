
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GradeInputProps {
  gradeInput: string;
  setGradeInput: (value: string) => void;
  maxPoints: number;
  currentScore?: number | null;
}

const GradeInput: React.FC<GradeInputProps> = ({
  gradeInput,
  setGradeInput,
  maxPoints,
  currentScore
}) => {
  const percentage = gradeInput ? ((parseFloat(gradeInput) / maxPoints) * 100).toFixed(1) : '';

  const getGradeColor = (grade: string) => {
    const score = parseFloat(grade);
    const percent = (score / maxPoints) * 100;
    if (percent >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percent >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percent >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Grade
        </label>
        <div className="flex items-center gap-2">
          {currentScore !== null && currentScore !== undefined && (
            <Badge variant="outline">Previously: {currentScore}/{maxPoints}</Badge>
          )}
          <span className="text-sm text-gray-500">
            out of {maxPoints} points
          </span>
        </div>
      </div>
      
      <div className="relative">
        <Input
          type="number"
          value={gradeInput}
          onChange={(e) => setGradeInput(e.target.value)}
          placeholder="Enter grade"
          max={maxPoints}
          min="0"
          step="0.5"
          className={`text-lg font-medium ${gradeInput ? getGradeColor(gradeInput) : ''}`}
        />
        {percentage && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="text-xs">
              {percentage}%
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Grade Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[maxPoints, maxPoints * 0.9, maxPoints * 0.8, maxPoints * 0.7].map((grade) => (
          <Button
            key={grade}
            variant="outline"
            size="sm"
            onClick={() => setGradeInput(grade.toString())}
            className="text-xs"
          >
            {grade} ({((grade / maxPoints) * 100).toFixed(0)}%)
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GradeInput;
