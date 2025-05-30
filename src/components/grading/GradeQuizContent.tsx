
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  fetchSubmissionAnswers: (submissionId: number) => Promise<SubmissionAnswer[] | null>;
}

const GradeQuizContent: React.FC<GradeQuizContentProps> = ({
  quiz,
  questions,
  submissions,
  gradeQuestion,
  setSubmissions,
  submissionAnswers,
  loadingAnswers,
  fetchSubmissionAnswers
}) => {
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Memoize the filtered questions to prevent infinite loops
  const manualGradingQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    
    return questions.filter(q => 
      q?.question_type === 'essay_question' || 
      q?.question_type === 'fill_in_multiple_blanks_question' ||
      q?.question_type === 'file_upload_question'
    );
  }, [questions]);

  // Set default selected question when manual grading questions change
  React.useEffect(() => {
    if (!selectedQuestionId && manualGradingQuestions.length > 0) {
      setSelectedQuestionId(manualGradingQuestions[0].id);
    }
  }, [selectedQuestionId, manualGradingQuestions]);

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

  const selectedQuestion = manualGradingQuestions.find(q => q.id === selectedQuestionId);
  const currentSubmissionAnswers = submissionAnswers[currentSubmission.id] || [];
  const isLoadingCurrentAnswers = loadingAnswers[currentSubmission.id] || false;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
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
            questions={manualGradingQuestions}
            selectedQuestionId={selectedQuestionId}
            onQuestionSelect={setSelectedQuestionId}
            submissionAnswers={currentSubmissionAnswers}
            loadingAnswers={isLoadingCurrentAnswers}
            onFetchAnswers={fetchSubmissionAnswers}
          />
        </div>

        {/* Grading Form */}
        <div className="lg:col-span-1">
          {selectedQuestion && (
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
