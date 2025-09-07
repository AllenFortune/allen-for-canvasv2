
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { useSubscription } from '@/hooks/useSubscription';
import GradeInput from './GradeInput';
import FeedbackInput from './FeedbackInput';
import SubmissionIndicator from './SubmissionIndicator';
import AIGradingSection from './AIGradingSection';
import ActionButtons from './ActionButtons';
import AIGradeReview from './AIGradeReview';
import VoiceControls from '@/components/VoiceControls';

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
  const { incrementUsage } = useSubscription();
  
  const [useRubricForAI, setUseRubricForAI] = useState(false);
  const [isSummativeAssessment, setIsSummativeAssessment] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiGradeReview, setAiGradeReview] = useState('');
  const maxPoints = assignment?.points_possible || 100;

  const handleAIAssistedGrading = async () => {
    if (!currentSubmission || !assignment) return;

    // Check usage limit before proceeding
    const canProceed = await incrementUsage();
    if (!canProceed) {
      return; // incrementUsage will show appropriate error message
    }

    const aiResult = await generateComprehensiveFeedback(
      currentSubmission,
      assignment,
      gradeInput,
      useRubricForAI,
      isSummativeAssessment,
      useCustomPrompt ? customPrompt : undefined
    );

    if (aiResult) {
      if (aiResult.grade !== null && aiResult.grade !== undefined) {
        setGradeInput(aiResult.grade.toString());
      }
      setCommentInput(aiResult.feedback || 'AI feedback could not be generated. Please try again.');
      setAiGradeReview(aiResult.gradeReview || '');
    }
  };

  // Voice controls context - pass all the necessary functions and state
  const voiceContext = {
    setGradeInput,
    setCommentInput,
    onSaveGrade,
    onAIGrading: handleAIAssistedGrading,
    setUseRubricForAI,
    setIsSummativeAssessment,
    setUseCustomPrompt,
    setCustomPrompt,
    // Current state for voice commands to reference
    gradeInput,
    commentInput,
    useRubricForAI,
    isSummativeAssessment,
    useCustomPrompt,
    customPrompt
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <CardTitle>Grade & Feedback</CardTitle>
          </div>
          <VoiceControls context={voiceContext} />
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

        <AIGradeReview 
          gradeReview={aiGradeReview}
          isVisible={!!aiGradeReview}
        />

        <SubmissionIndicator currentSubmission={currentSubmission} />

        <AIGradingSection
          isSummativeAssessment={isSummativeAssessment}
          setIsSummativeAssessment={setIsSummativeAssessment}
          useRubricForAI={useRubricForAI}
          setUseRubricForAI={setUseRubricForAI}
          useCustomPrompt={useCustomPrompt}
          setUseCustomPrompt={setUseCustomPrompt}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          assignment={assignment}
          category="assignment"
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
          useCustomPrompt={useCustomPrompt}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedGradingForm;
