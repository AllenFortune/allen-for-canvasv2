
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Sparkles, CheckCircle } from 'lucide-react';
import { Assignment, DiscussionSubmission } from '@/types/grading';

interface ActionButtonsProps {
  onAIGrading: () => void;
  onSaveGrade: () => void;
  isGenerating: boolean;
  isProcessingFiles: boolean;
  saving: boolean;
  gradeInput: string;
  currentSubmission?: DiscussionSubmission;
  assignment: Assignment | null;
  useRubricForAI: boolean;
  isSummativeAssessment: boolean;
  useCustomPrompt: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAIGrading,
  onSaveGrade,
  isGenerating,
  isProcessingFiles,
  saving,
  gradeInput,
  currentSubmission,
  assignment,
  useRubricForAI,
  isSummativeAssessment,
  useCustomPrompt
}) => {
  const hasFiles = currentSubmission?.attachments && currentSubmission.attachments.length > 0;
  const hasRubric = assignment?.rubric && Object.keys(assignment.rubric).length > 0;
  const isPlaceholderSubmission = typeof currentSubmission?.id === 'string' && 
    currentSubmission.id.toString().startsWith('placeholder_');
  const canSave = gradeInput && !saving && !isPlaceholderSubmission;
  const isAlreadyGraded = currentSubmission?.workflow_state === 'graded';

  return (
    <div className="space-y-3">
      {/* Indicators Section */}
      <div className="flex flex-wrap gap-2 justify-center">
        {hasFiles && (
          <Badge variant="secondary" className="text-xs">
            Files
          </Badge>
        )}
        {hasRubric && (
          <Badge variant="secondary" className="text-xs">
            {useRubricForAI ? 'Rubric' : 'Description'}
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          {isSummativeAssessment ? 'Summative' : 'Formative'}
        </Badge>
        {useCustomPrompt && (
          <Badge variant="secondary" className="text-xs">
            Custom
          </Badge>
        )}
        {isAlreadyGraded && (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Graded
          </Badge>
        )}
      </div>

      {/* AI Grading Button */}
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={onAIGrading}
        disabled={isGenerating || isProcessingFiles || !currentSubmission || isPlaceholderSubmission}
      >
        {isProcessingFiles ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Processing Files...
          </>
        ) : isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Generating {isSummativeAssessment ? 'Summative' : 'Formative'} Feedback...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI-Assisted Grading
          </>
        )}
      </Button>

      <Button 
        onClick={onSaveGrade}
        disabled={!canSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        {saving ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving to Canvas...
          </div>
        ) : isPlaceholderSubmission ? (
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            No Submission to Grade
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Grade & Feedback
          </div>
        )}
      </Button>
      
      {isPlaceholderSubmission && (
        <p className="text-xs text-gray-500 text-center">
          This student hasn't submitted anything yet
        </p>
      )}
    </div>
  );
};

export default ActionButtons;
