
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import AnswerContentRenderer from './AnswerContentRenderer';

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface StudentAnswerSectionProps {
  answer: SubmissionAnswer | undefined;
  questionType: string;
  loadingAnswers: boolean;
  answersError: string;
  onRetryAnswers: () => void;
}

const StudentAnswerSection: React.FC<StudentAnswerSectionProps> = ({
  answer,
  questionType,
  loadingAnswers,
  answersError,
  onRetryAnswers
}) => {
  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-sm text-gray-700 mb-2">Student Answer:</h4>
      {loadingAnswers ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : answersError ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Unable to load student answer. You can still grade this question based on other information available.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAnswers}
            className="mt-2 text-yellow-700 border-yellow-300"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        </div>
      ) : (
        <AnswerContentRenderer answer={answer} questionType={questionType} />
      )}
    </div>
  );
};

export default StudentAnswerSection;
