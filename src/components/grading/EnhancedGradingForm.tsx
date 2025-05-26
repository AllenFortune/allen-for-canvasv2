
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Save, Award } from 'lucide-react';
import { Assignment } from '@/types/grading';

interface EnhancedGradingFormProps {
  assignment: Assignment | null;
  gradeInput: string;
  setGradeInput: (value: string) => void;
  commentInput: string;
  setCommentInput: (value: string) => void;
  onSaveGrade: () => void;
  saving: boolean;
  currentScore?: number | null;
}

const EnhancedGradingForm: React.FC<EnhancedGradingFormProps> = ({
  assignment,
  gradeInput,
  setGradeInput,
  commentInput,
  setCommentInput,
  onSaveGrade,
  saving,
  currentScore
}) => {
  const maxPoints = assignment?.points_possible || 100;
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
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <CardTitle>Grade & Feedback</CardTitle>
          </div>
          {currentScore !== null && currentScore !== undefined && (
            <Badge variant="outline">Previously: {currentScore}/{maxPoints}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grade Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Grade
            </label>
            <span className="text-sm text-gray-500">
              out of {maxPoints} points
            </span>
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

        {/* Comments */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Feedback & Comments
          </label>
          <Textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Provide constructive feedback for the student..."
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onSaveGrade}
            disabled={saving || !gradeInput}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Grade & Feedback
              </div>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => {/* TODO: Implement AI assist */}}
          >
            <Bot className="w-4 h-4" />
            AI-Powered Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedGradingForm;
