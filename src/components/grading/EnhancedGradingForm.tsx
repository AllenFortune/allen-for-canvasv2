
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Award, Sparkles, FileText } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';
import { useAIFeedback } from '@/hooks/useAIFeedback';

interface EnhancedGradingFormProps {
  assignment: Assignment | null;
  gradeInput: string;
  setGradeInput: (value: string) => void;
  commentInput: string;
  setCommentInput: (value: string) => void;
  onSaveGrade: () => void;
  saving: boolean;
  currentScore?: number | null;
  currentSubmission?: Submission;
}

const EnhancedGradingForm: React.FC<EnhancedGradingFormProps> = ({
  assignment,
  gradeInput,
  setGradeInput,
  commentInput,
  setCommentInput,
  onSaveGrade,
  saving,
  currentScore,
  currentSubmission
}) => {
  const { generateComprehensiveFeedback, isGenerating, isProcessingFiles } = useAIFeedback();
  const [useRubricForAI, setUseRubricForAI] = useState(false);
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

  const handleAIAssistedGrading = async () => {
    if (!currentSubmission || !assignment) return;

    const aiResult = await generateComprehensiveFeedback(
      currentSubmission,
      assignment,
      gradeInput,
      useRubricForAI
    );

    if (aiResult) {
      // Populate the grade if AI provided one
      if (aiResult.grade !== null && aiResult.grade !== undefined) {
        setGradeInput(aiResult.grade.toString());
      }

      // Use the AI-generated feedback directly - it's now student-directed and in paragraph form
      setCommentInput(aiResult.feedback || 'AI feedback could not be generated. Please try again.');
    }
  };

  // Check if assignment has a rubric
  const hasRubric = assignment?.rubric && Object.keys(assignment.rubric).length > 0;

  // Check if submission has files
  const hasFiles = currentSubmission?.attachments && currentSubmission.attachments.length > 0;

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

        {/* Feedback */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Feedback for Student
          </label>
          <Textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write feedback for the student or use AI-assisted grading to generate personalized, paragraph-form feedback..."
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Submission Type Indicator */}
        {hasFiles && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <FileText className="w-4 h-4" />
              <span className="font-medium">File Submission Detected</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              AI will process and analyze file content for grading
            </p>
          </div>
        )}

        {/* AI Grading Options */}
        {hasRubric && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  AI Grading Mode
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
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleAIAssistedGrading}
            disabled={isGenerating || isProcessingFiles || !currentSubmission}
          >
            {isProcessingFiles ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Processing Files...
              </>
            ) : isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Generating Student Feedback...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI-Assisted Grading
                {hasFiles && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Files
                  </Badge>
                )}
                {hasRubric && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {useRubricForAI ? 'Rubric' : 'Description'}
                  </Badge>
                )}
              </>
            )}
          </Button>

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
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedGradingForm;
