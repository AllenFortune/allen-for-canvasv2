
import React from 'react';
import QuizSubmissionView from './QuizSubmissionView';
import QuizGradingFormWithLocalState from './QuizGradingFormWithLocalState';

interface Quiz {
  id: number;
  title: string;
  description: string;
  points_possible: number;
  time_limit: number;
  allowed_attempts: number;
  quiz_type: string;
  is_assignment_based?: boolean;
  assignment_id?: number;
}

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  user_id: number;
  attempt: number;
  score: number | null;
  kept_score: number | null;
  workflow_state: string;
  started_at: string | null;
  finished_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
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

interface QuizGradingLayoutProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  selectedQuestionId: number | null;
  selectedSubmission: QuizSubmission;
  onQuestionSelect: (questionId: number) => void;
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string) => Promise<boolean>;
  onGradeUpdate?: (submissionId: number, score: string, questionId?: number) => void;
  submissionAnswers: {[submissionId: number]: SubmissionAnswer[]};
  loadingAnswers: {[submissionId: number]: boolean};
  answersErrors: {[submissionId: number]: string};
  fetchSubmissionAnswers: (submissionId: number, userId?: number) => Promise<SubmissionAnswer[] | null>;
  retryAnswersFetch: (submissionId: number, userId?: number) => void;
  manualGradingQuestions: QuizQuestion[];
  localGradingState?: {[submissionId: number]: {[questionId: number]: boolean}};
}

const QuizGradingLayout: React.FC<QuizGradingLayoutProps> = ({
  quiz,
  questions,
  selectedQuestionId,
  selectedSubmission,
  onQuestionSelect,
  gradeQuestion,
  onGradeUpdate,
  submissionAnswers,
  loadingAnswers,
  answersErrors,
  fetchSubmissionAnswers,
  retryAnswersFetch,
  manualGradingQuestions,
  localGradingState = {}
}) => {
  const selectedQuestion = selectedQuestionId ? questions.find(q => q.id === selectedQuestionId) : null;
  const selectedSubmissionAnswers = submissionAnswers[selectedSubmission.id] || [];
  const selectedAnswer = selectedSubmissionAnswers.find(a => a.question_id === selectedQuestionId);

  const handleFetchAnswers = (submissionId: number, userId?: number) => {
    console.log(`QuizGradingLayout: Fetching answers for submission ${submissionId}, user ${userId}`);
    return fetchSubmissionAnswers(submissionId, userId);
  };

  const handleRetryAnswers = (submissionId: number, userId?: number) => {
    console.log(`QuizGradingLayout: Retrying answers for submission ${submissionId}, user ${userId}`);
    retryAnswersFetch(submissionId, userId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Questions and Answers (now wider) */}
      <div className="lg:col-span-1">
        <QuizSubmissionView
          submission={selectedSubmission}
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onQuestionSelect={onQuestionSelect}
          submissionAnswers={selectedSubmissionAnswers}
          loadingAnswers={loadingAnswers[selectedSubmission.id] || false}
          answersError={answersErrors[selectedSubmission.id] || ''}
          onFetchAnswers={handleFetchAnswers}
          onRetryAnswers={handleRetryAnswers}
          manualGradingQuestions={manualGradingQuestions}
          quiz={quiz}
        />
      </div>

      {/* Right Panel - Grading Form (now wider) */}
      <div className="lg:col-span-1">
        {selectedQuestion && (
          <QuizGradingFormWithLocalState
            submission={selectedSubmission}
            question={selectedQuestion}
            submissionAnswer={selectedAnswer}
            gradeQuestion={gradeQuestion}
            onGradeUpdate={onGradeUpdate}
            locallyGraded={localGradingState[selectedSubmission.id]?.[selectedQuestion.id] || false}
          />
        )}
      </div>
    </div>
  );
};

export default QuizGradingLayout;
