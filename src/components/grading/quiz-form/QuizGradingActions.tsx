
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import QuizAIGradingSection from '../QuizAIGradingSection';
import AIGradeReview from '../AIGradeReview';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface QuizGradingActionsProps {
  score: string;
  saving: boolean;
  onSave: () => void;
  question: QuizQuestion;
  submissionAnswer?: SubmissionAnswer;
  onAIGrade: () => Promise<void>;
  isGenerating: boolean;
  useRubric: boolean;
  setUseRubric: (value: boolean) => void;
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  aiGradeReview: string;
}

const QuizGradingActions: React.FC<QuizGradingActionsProps> = ({
  score,
  saving,
  onSave,
  question,
  submissionAnswer,
  onAIGrade,
  isGenerating,
  useRubric,
  setUseRubric,
  isSummativeAssessment,
  setIsSummativeAssessment,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  aiGradeReview
}) => {
  return (
    <>
      <Button 
        onClick={onSave} 
        disabled={saving || !score}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Grade
          </>
        )}
      </Button>

      <QuizAIGradingSection
        question={question}
        submissionAnswer={submissionAnswer}
        onAIGrade={onAIGrade}
        isGenerating={isGenerating}
        useRubric={useRubric}
        setUseRubric={setUseRubric}
        isSummativeAssessment={isSummativeAssessment}
        setIsSummativeAssessment={setIsSummativeAssessment}
        useCustomPrompt={useCustomPrompt}
        setUseCustomPrompt={setUseCustomPrompt}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
      />

      <AIGradeReview 
        gradeReview={aiGradeReview}
        isVisible={!!aiGradeReview}
      />
    </>
  );
};

export default QuizGradingActions;
