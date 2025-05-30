
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import QuizGradingForm from './QuizGradingForm';
import QuizStudentNavigation from './QuizStudentNavigation';
import QuizSubmissionView from './QuizSubmissionView';

interface Quiz {
  id: number;
  title: string;
  points_possible: number;
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
  quiz_id: number;
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
  setSubmissions: React.Dispatch<React.SetStateAction<QuizSubmission[]>>;
  submissionAnswers: {[submissionId: number]: SubmissionAnswer[]};
  loadingAnswers: {[submissionId: number]: boolean};
  answersErrors: {[submissionId: number]: string};
  fetchSubmissionAnswers: (submissionId: number) => Promise<SubmissionAnswer[] | null>;
  retryAnswersFetch: (submissionId: number) => void;
}

const GradeQuizContent: React.FC<GradeQuizContentProps> = ({
  quiz,
  questions,
  submissions,
  gradeQuestion,
  setSubmissions,
  submissionAnswers,
  loadingAnswers,
  answersErrors,
  fetchSubmissionAnswers,
  retryAnswersFetch
}) => {
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Show ALL questions instead of filtering
  const allQuestions = useMemo(() => {
    return Array.isArray(questions) ? questions : [];
  }, [questions]);

  // Get manual grading questions for quick navigation
  const manualGradingQuestions = useMemo(() => {
    return allQuestions.filter(q => 
      q?.question_type === 'essay_question' || 
      q?.question_type === 'fill_in_multiple_blanks_question' ||
      q?.question_type === 'file_upload_question'
    );
  }, [allQuestions]);

  // Set default selected question when questions change
  React.useEffect(() => {
    if (!selectedQuestionId && allQuestions.length > 0) {
      setSelectedQuestionId(allQuestions[0].id);
    }
  }, [selectedQuestionId, allQuestions]);

  // Defensive check for submissions array
  const safeSubmissions = useMemo(() => {
    return Array.isArray(submissions) ? submissions : [];
  }, [submissions]);

  if (!quiz || safeSubmissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 text-center">
              {!quiz ? 'Loading quiz data...' : 'No submissions found for this quiz.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe access to current submission with bounds checking
  const currentSubmission = safeSubmissions[currentSubmissionIndex];
  if (!currentSubmission) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 text-center">
              No valid submission found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedQuestion = allQuestions.find(q => q.id === selectedQuestionId);
  const currentSubmissionAnswers = submissionAnswers[currentSubmission.id] || [];
  const isLoadingCurrentAnswers = loadingAnswers[currentSubmission.id] || false;
  const currentAnswersError = answersErrors[currentSubmission.id] || '';

  const jumpToFirstEssay = () => {
    if (manualGradingQuestions.length > 0) {
      setSelectedQuestionId(manualGradingQuestions[0].id);
    }
  };

  const isManualGradingQuestion = (questionType: string) => {
    return questionType === 'essay_question' || 
           questionType === 'fill_in_multiple_blanks_question' ||
           questionType === 'file_upload_question';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Quick navigation to essay questions */}
      {manualGradingQuestions.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Manual Grading Required</span>
                  <Badge variant="secondary">
                    {manualGradingQuestions.length} essay question{manualGradingQuestions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToFirstEssay}
                  className="text-xs"
                >
                  Jump to Essays
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Navigation */}
        <div className="lg:col-span-1">
          <QuizStudentNavigation
            submissions={safeSubmissions}
            currentIndex={currentSubmissionIndex}
            onStudentSelect={setCurrentSubmissionIndex}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <QuizSubmissionView
            submission={currentSubmission}
            questions={allQuestions}
            selectedQuestionId={selectedQuestionId}
            onQuestionSelect={setSelectedQuestionId}
            submissionAnswers={currentSubmissionAnswers}
            loadingAnswers={isLoadingCurrentAnswers}
            answersError={currentAnswersError}
            onFetchAnswers={fetchSubmissionAnswers}
            onRetryAnswers={retryAnswersFetch}
            manualGradingQuestions={manualGradingQuestions}
          />
        </div>

        {/* Grading Form - Only show for manual grading questions */}
        <div className="lg:col-span-1">
          {selectedQuestion && isManualGradingQuestion(selectedQuestion.question_type) && (
            <QuizGradingForm
              submission={currentSubmission}
              question={selectedQuestion}
              gradeQuestion={gradeQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeQuizContent;
