
import React, { useEffect, useState } from 'react';
import QuizSubmissionInfo from './QuizSubmissionInfo';
import QuizQuestionsList from './QuizQuestionsList';
import QuizQuestionDetails from './QuizQuestionDetails';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  attempt: number;
  started_at: string | null;
  finished_at: string | null;
  workflow_state: string;
  user: {
    name: string;
    sortable_name: string;
  };
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface QuizSubmissionViewProps {
  submission: QuizSubmission;
  questions: QuizQuestion[];
  selectedQuestionId: number | null;
  onQuestionSelect: (questionId: number) => void;
  submissionAnswers?: SubmissionAnswer[];
  loadingAnswers?: boolean;
  answersError?: string;
  onFetchAnswers: (submissionId: number) => void;
  onRetryAnswers?: (submissionId: number) => void;
  manualGradingQuestions?: QuizQuestion[];
}

const QuizSubmissionView: React.FC<QuizSubmissionViewProps> = ({
  submission,
  questions,
  selectedQuestionId,
  onQuestionSelect,
  submissionAnswers = [],
  loadingAnswers = false,
  answersError = '',
  onFetchAnswers,
  onRetryAnswers,
  manualGradingQuestions = []
}) => {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch answers when submission changes, but only once per submission load
  useEffect(() => {
    if (submission && !submissionAnswers.length && !loadingAnswers && !hasAttemptedFetch && !answersError) {
      setHasAttemptedFetch(true);
      onFetchAnswers(submission.id);
    }
  }, [submission.id, submissionAnswers.length, loadingAnswers, hasAttemptedFetch, answersError, onFetchAnswers]);

  const handleRetryAnswers = () => {
    setHasAttemptedFetch(false);
    if (onRetryAnswers) {
      onRetryAnswers(submission.id);
    } else {
      onFetchAnswers(submission.id);
    }
  };

  return (
    <div className="space-y-6">
      <QuizSubmissionInfo submission={submission} />
      
      <QuizQuestionsList
        questions={questions}
        selectedQuestionId={selectedQuestionId}
        onQuestionSelect={onQuestionSelect}
        submissionAnswers={submissionAnswers}
        loadingAnswers={loadingAnswers}
        answersError={answersError}
        onRetryAnswers={handleRetryAnswers}
        manualGradingQuestions={manualGradingQuestions}
      />

      <QuizQuestionDetails
        selectedQuestionId={selectedQuestionId}
        questions={questions}
        submissionAnswers={submissionAnswers}
        loadingAnswers={loadingAnswers}
        answersError={answersError}
        onRetryAnswers={handleRetryAnswers}
      />
    </div>
  );
};

export default QuizSubmissionView;
