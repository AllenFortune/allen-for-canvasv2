
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import QuizSubmissionView from './QuizSubmissionView';
import QuizGradingForm from './QuizGradingForm';
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
  setSubmissions,
  submissionAnswers,
  loadingAnswers,
  answersErrors,
  fetchSubmissionAnswers,
  retryAnswersFetch
}) => {
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const selectedSubmission = submissions[selectedSubmissionIndex];

  // Auto-select first question when submission changes
  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const navigateSubmission = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
    } else if (direction === 'next' && selectedSubmissionIndex < submissions.length - 1) {
      setSelectedSubmissionIndex(selectedSubmissionIndex + 1);
    }
  };

  const getManualGradingQuestions = () => {
    return questions.filter(q => 
      q.question_type === 'essay_question' || 
      q.question_type === 'fill_in_multiple_blanks_question' ||
      q.question_type === 'file_upload_question'
    );
  };

  const handleFetchAnswers = (submissionId: number, userId?: number) => {
    console.log(`GradeQuizContent: Fetching answers for submission ${submissionId}, user ${userId}`);
    return fetchSubmissionAnswers(submissionId, userId);
  };

  const handleRetryAnswers = (submissionId: number, userId?: number) => {
    console.log(`GradeQuizContent: Retrying answers for submission ${submissionId}, user ${userId}`);
    retryAnswersFetch(submissionId, userId);
  };

  if (!quiz) {
    return <ErrorDisplay error="Quiz data not found" onRetry={() => {}} />;
  }

  if (submissions.length === 0) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Submission Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Current Submission Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedSubmissionIndex + 1} of {submissions.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateSubmission('prev')}
                      disabled={selectedSubmissionIndex === 0}
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateSubmission('next')}
                      disabled={selectedSubmissionIndex === submissions.length - 1}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium text-blue-900">{selectedSubmission.user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedSubmission.workflow_state === 'complete' ? 'default' : 'secondary'}>
                    {selectedSubmission.workflow_state}
                  </Badge>
                  {selectedSubmission.score !== null && (
                    <Badge variant="outline">
                      {selectedSubmission.score} pts
                    </Badge>
                  )}
                </div>
              </div>

              {/* All Submissions List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {submissions.map((submission, index) => (
                  <Button
                    key={submission.id}
                    variant={index === selectedSubmissionIndex ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedSubmissionIndex(index)}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <span className="font-medium truncate">{submission.user.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant={submission.workflow_state === 'complete' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {submission.workflow_state}
                        </Badge>
                        {submission.score !== null && (
                          <span className="text-gray-500">{submission.score} pts</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Questions and Answers */}
        <div className="lg:col-span-1">
          <QuizSubmissionView
            submission={selectedSubmission}
            questions={questions}
            selectedQuestionId={selectedQuestionId}
            onQuestionSelect={setSelectedQuestionId}
            submissionAnswers={submissionAnswers[selectedSubmission.id] || []}
            loadingAnswers={loadingAnswers[selectedSubmission.id] || false}
            answersError={answersErrors[selectedSubmission.id] || ''}
            onFetchAnswers={handleFetchAnswers}
            onRetryAnswers={handleRetryAnswers}
            manualGradingQuestions={getManualGradingQuestions()}
            quiz={quiz}
          />
        </div>

        {/* Right Panel - Grading Form */}
        <div className="lg:col-span-1">
          {selectedQuestionId && (
            <QuizGradingForm
              submission={selectedSubmission}
              questionId={selectedQuestionId}
              questions={questions}
              onGrade={gradeQuestion}
              onNext={() => {
                const currentIndex = questions.findIndex(q => q.id === selectedQuestionId);
                if (currentIndex < questions.length - 1) {
                  setSelectedQuestionId(questions[currentIndex + 1].id);
                }
              }}
              onPrev={() => {
                const currentIndex = questions.findIndex(q => q.id === selectedQuestionId);
                if (currentIndex > 0) {
                  setSelectedQuestionId(questions[currentIndex - 1].id);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeQuizContent;
