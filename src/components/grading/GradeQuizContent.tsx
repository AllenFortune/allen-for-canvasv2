import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import QuizGradingLayout from './QuizGradingLayout';
import HorizontalQuizStudentNav from './HorizontalQuizStudentNav';
import ErrorDisplay from './ErrorDisplay';

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

interface GradeQuizContentProps {
  quiz: Quiz | null;
  questions: QuizQuestion[];
  submissions: QuizSubmission[];
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string) => Promise<boolean>;
  setSubmissions: (submissions: QuizSubmission[]) => void;
  submissionAnswers: {[submissionId: number]: SubmissionAnswer[]};
  loadingAnswers: {[submissionId: number]: boolean};
  answersErrors: {[submissionId: number]: string};
  fetchSubmissionAnswers: (submissionId: number, userId?: number) => Promise<SubmissionAnswer[] | null>;
  retryAnswersFetch: (submissionId: number, userId?: number) => void;
}

const GradeQuizContent: React.FC<GradeQuizContentProps> = ({
  quiz,
  questions,
  submissions,
  gradeQuestion,
  submissionAnswers,
  loadingAnswers,
  answersErrors,
  fetchSubmissionAnswers,
  retryAnswersFetch
}) => {
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Sort submissions alphabetically by last name (sortable_name)
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => 
      a.user.sortable_name.localeCompare(b.user.sortable_name)
    );
  }, [submissions]);

  const selectedSubmission = sortedSubmissions[selectedSubmissionIndex];

  // Get essay questions only
  const essayQuestions = useMemo(() => {
    return questions.filter(q => q.question_type === 'essay_question');
  }, [questions]);

  // Auto-select first essay question when submission changes or questions load
  useEffect(() => {
    if (essayQuestions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(essayQuestions[0].id);
    }
  }, [essayQuestions, selectedQuestionId]);

  const navigateSubmission = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
    } else if (direction === 'next' && selectedSubmissionIndex < sortedSubmissions.length - 1) {
      setSelectedSubmissionIndex(selectedSubmissionIndex + 1);
    }
  };

  const getManualGradingQuestions = () => {
    // Only return essay questions to match the filtering in QuizQuestionsList
    return questions.filter(q => q.question_type === 'essay_question');
  };

  if (!quiz) {
    return <ErrorDisplay error="Quiz data not found" onRetry={() => {}} />;
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
            <p className="text-gray-600">
              This quiz doesn't have any submissions to grade yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Horizontal Student Navigation */}
      <HorizontalQuizStudentNav
        sortedSubmissions={sortedSubmissions}
        selectedSubmissionIndex={selectedSubmissionIndex}
        onSubmissionSelect={setSelectedSubmissionIndex}
        onNavigate={navigateSubmission}
      />

      {/* Main Grading Layout */}
      <QuizGradingLayout
        quiz={quiz}
        questions={questions}
        selectedQuestionId={selectedQuestionId}
        selectedSubmission={selectedSubmission}
        onQuestionSelect={setSelectedQuestionId}
        gradeQuestion={gradeQuestion}
        submissionAnswers={submissionAnswers}
        loadingAnswers={loadingAnswers}
        answersErrors={answersErrors}
        fetchSubmissionAnswers={fetchSubmissionAnswers}
        retryAnswersFetch={retryAnswersFetch}
        manualGradingQuestions={getManualGradingQuestions()}
      />
    </div>
  );
};

export default GradeQuizContent;
