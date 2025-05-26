
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import GradeInput from './GradeInput';
import FeedbackInput from './FeedbackInput';
import SubmissionIndicator from './SubmissionIndicator';
import AIGradingSection from './AIGradingSection';
import ActionButtons from './ActionButtons';

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
  const [isSummativeAssessment, setIsSummativeAssessment] = useState(true);
  const maxPoints = assignment?.points_possible || 100;

  const handleAIAssistedGrading = async () => {
    if (!currentSubmission || !assignment) return;

    const aiResult = await generateComprehensiveFeedback(
      currentSubmission,
      assignment,
      gradeInput,
      useRubricForAI,
      isSummativeAssessment
    );

    if (aiResult) {
      if (aiResult.grade !== null && aiResult.grade !== undefined) {
        setGradeInput(aiResult.grade.toString());
      }
      setCommentInput(aiResult.feedback || 'AI feedback could not be generated. Please try again.');
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <CardTitle>Grade & Feedback</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <GradeInput
          gradeInput={gradeInput}
          setGradeInput={setGradeInput}
          maxPoints={maxPoints}
          currentScore={currentScore}
        />

        <FeedbackInput
          commentInput={commentInput}
          setCommentInput={setCommentInput}
        />

        <SubmissionIndicator currentSubmission={currentSubmission} />

        <AIGradingSection
          isSummativeAssessment={isSummativeAssessment}
          setIsSummativeAssessment={setIsSummativeAssessment}
          useRubricForAI={useRubricForAI}
          setUseRubricForAI={setUseRubricForAI}
          assignment={assignment}
        />

        <ActionButtons
          onAIGrading={handleAIAssistedGrading}
          onSaveGrade={onSaveGrade}
          isGenerating={isGenerating}
          isProcessingFiles={isProcessingFiles}
          saving={saving}
          gradeInput={gradeInput}
          currentSubmission={currentSubmission}
          assignment={assignment}
          useRubricForAI={useRubricForAI}
          isSummativeAssessment={isSummativeAssessment}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedGradingForm;
