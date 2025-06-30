
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface QuizQuestionsErrorAlertProps {
  answersError: string;
  onRetryAnswers: () => void;
}

const QuizQuestionsErrorAlert: React.FC<QuizQuestionsErrorAlertProps> = ({
  answersError,
  onRetryAnswers
}) => {
  if (!answersError) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-red-700 font-medium">Failed to load student answers</p>
          <p className="text-xs text-red-600">{answersError}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetryAnswers}
          className="text-red-700 border-red-300"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestionsErrorAlert;
