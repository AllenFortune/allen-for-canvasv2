
import React from 'react';
import QuizSubmissionView from './QuizSubmissionView';
import QuizGradingForm from './QuizGradingForm';
import QuizNavigationPanel from './QuizNavigationPanel';

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
  sortedSubmissions: QuizSubmission[];
  selectedSubmissionIndex: number;
  selectedQuestionId: number | null;
  selectedSubmission: QuizSubmission;
  onSubmissionSelect: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onQuestionSelect: (questionId: number) => void;
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string) => Promise<boolean>;
  submissionAnswers: {[submissionId: number]: SubmissionAnswer[]};
  loadingAnswers: {[submissionId: number]: boolean};
  answersErrors: {[submissionId: number]: string};
  fetchSubmissionAnswers: (submissionId: number, userId?: number) => Promise<SubmissionAnswer[] | null>;
  retryAnswersFetch: (submissionId: number, userId?: number) => void;
  manualGradingQuestions: QuizQuestion[];
}

const QuizGradingLayout: React.FC<QuizGradingLayoutProps> = ({
  quiz,
  questions,
  sortedSubmissions,
  selectedSubmissionIndex,
  selectedQuestionId,
  selectedSubmission,
  onSubmissionSelect,
  onNavigate,
  onQuestionSelect,
  gradeQuestion,
  submissionAnswers,
  loadingAnswers,
  answersErrors,
  fetchSubmissionAnswers,
  retryAnswersFetch,
  manualGradingQuestions
}) => {
  const selectedQuestion = selectedQuestionId ? questions.find(q => q.id === selectedQuestionId) : null;

  const handleFetchAnswers = (submissionId: number, userId?: number) => {
    console.log(`QuizGradingLayout: Fetching answers for submission ${submissionId}, user ${userId}`);
    return fetchSubmissionAnswers(submissionId, userId);
  };

  const handleRetryAnswers = (submissionId: number, userId?: number) => {
    console.log(`QuizGradingLayout: Retrying answers for submission ${submissionId}, user ${userId}`);
    retryAnswersFetch(submissionId, userId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Submission Navigation */}
      <div className="lg:col-span-1">
        <QuizNavigationPanel
          sortedSubmissions={sortedSubmissions}
          selectedSubmissionIndex={selectedSubmissionIndex}
          onSubmissionSelect={onSubmissionSelect}
          onNavigate={onNavigate}
        />
      </div>

      {/* Center Panel - Questions and Answers */}
      <div className="lg:col-span-1">
        <QuizSubmissionView
          submission={selectedSubmission}
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onQuestionSelect={onQuestionSelect}
          submissionAnswers={submissionAnswers[selectedSubmission.id] || []}
          loadingAnswers={loadingAnswers[selectedSubmission.id] || false}
          answersError={answersErrors[selectedSubmission.id] || ''}
          onFetchAnswers={handleFetchAnswers}
          onRetryAnswers={handleRetryAnswers}
          manualGradingQuestions={manualGradingQuestions}
          quiz={quiz}
        />
      </div>

      {/* Right Panel - Grading Form */}
      <div className="lg:col-span-1">
        {selectedQuestion && (
          <QuizGradingForm
            submission={selectedSubmission}
            question={selectedQuestion}
            gradeQuestion={gradeQuestion}
          />
        )}
      </div>
    </div>
  );
};

export default QuizGradingLayout;
