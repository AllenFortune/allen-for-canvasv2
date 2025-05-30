
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
  user_id: number;
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

interface Quiz {
  id: number;
  title: string;
  is_assignment_based?: boolean;
  assignment_id?: number;
}

interface QuizSubmissionViewProps {
  submission: QuizSubmission;
  questions: QuizQuestion[];
  selectedQuestionId: number | null;
  onQuestionSelect: (questionId: number) => void;
  submissionAnswers?: SubmissionAnswer[];
  loadingAnswers?: boolean;
  answersError?: string;
  onFetchAnswers: (submissionId: number, userId?: number) => void;
  onRetryAnswers?: (submissionId: number, userId?: number) => void;
  manualGradingQuestions?: QuizQuestion[];
  quiz?: Quiz;
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
  manualGradingQuestions = [],
  quiz
}) => {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch answers when submission changes, but only once per submission load
  useEffect(() => {
    if (submission && !submissionAnswers.length && !loadingAnswers && !hasAttemptedFetch && !answersError) {
      setHasAttemptedFetch(true);
      
      // For assignment-based quizzes (New Quizzes), pass the user_id
      const shouldPassUserId = quiz?.is_assignment_based || quiz?.assignment_id;
      const userId = shouldPassUserId ? submission.user_id : undefined;
      
      console.log(`Fetching answers for submission ${submission.id}, quiz assignment-based: ${shouldPassUserId}, user ID: ${userId}`);
      onFetchAnswers(submission.id, userId);
    }
  }, [submission.id, submissionAnswers.length, loadingAnswers, hasAttemptedFetch, answersError, onFetchAnswers, quiz?.is_assignment_based, quiz?.assignment_id, submission.user_id]);

  const handleRetryAnswers = () => {
    setHasAttemptedFetch(false);
    
    // For assignment-based quizzes (New Quizzes), pass the user_id
    const shouldPassUserId = quiz?.is_assignment_based || quiz?.assignment_id;
    const userId = shouldPassUserId ? submission.user_id : undefined;
    
    console.log(`Retrying answers for submission ${submission.id}, quiz assignment-based: ${shouldPassUserId}, user ID: ${userId}`);
    
    if (onRetryAnswers) {
      onRetryAnswers(submission.id, userId);
    } else {
      onFetchAnswers(submission.id, userId);
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
