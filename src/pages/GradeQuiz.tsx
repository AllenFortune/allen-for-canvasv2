
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnhancedQuizHeader from '@/components/grading/EnhancedQuizHeader';
import GradeQuizContent from '@/components/grading/GradeQuizContent';
import ErrorDisplay from '@/components/grading/ErrorDisplay';
import LoadingDisplay from '@/components/grading/LoadingDisplay';
import { useGradeQuiz } from '@/hooks/useGradeQuiz';
import { useAuth } from '@/contexts/AuthContext';

const GradeQuiz = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const { session } = useAuth();
  const {
    quiz,
    questions,
    submissions,
    submissionAnswers,
    loadingAnswers,
    answersErrors,
    loading,
    error,
    gradeQuestion,
    fetchSubmissionAnswers,
    retryFetch,
    retryAnswersFetch,
    refreshSubmissions,
    setSubmissions
  } = useGradeQuiz(courseId, quizId);

  // Track graded questions per submission to show partial grading progress
  const [gradedQuestions, setGradedQuestions] = useState<{[submissionId: number]: Set<number>}>({});

  if (!session) {
    return <LoadingDisplay />;
  }

  if (loading) {
    return <LoadingDisplay />;
  }

  // Create a wrapper function to match the expected signature
  const handleSetSubmissions = (newSubmissions: any[]) => {
    setSubmissions(newSubmissions);
  };

  // Get manual grading questions (essay questions)
  const manualGradingQuestions = useMemo(() => {
    return questions.filter(q => q.question_type === 'essay_question');
  }, [questions]);

  // Handle grade updates - track individual question completion instead of marking entire submission as graded
  const handleGradeUpdate = (submissionId: number, score: string, questionId: number) => {
    // Update the graded questions tracking
    setGradedQuestions(prev => ({
      ...prev,
      [submissionId]: new Set([...(prev[submissionId] || []), questionId])
    }));
    
    // Don't optimistically mark the entire submission as graded
    // Let Canvas determine the final status when all questions are complete
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16">
          <EnhancedQuizHeader 
            courseId={courseId!} 
            quiz={quiz}
            submissions={submissions}
            questions={questions}
            onRefreshSubmissions={refreshSubmissions}
          />

          {error && (
            <div className="max-w-7xl mx-auto px-6 py-6">
              <ErrorDisplay error={error} onRetry={retryFetch} />
            </div>
          )}

          <GradeQuizContent
            quiz={quiz}
            questions={questions}
            submissions={submissions}
            gradeQuestion={gradeQuestion}
            onGradeUpdate={handleGradeUpdate}
            setSubmissions={handleSetSubmissions}
            submissionAnswers={submissionAnswers}
            loadingAnswers={loadingAnswers}
            answersErrors={answersErrors}
            fetchSubmissionAnswers={fetchSubmissionAnswers}
            retryAnswersFetch={retryAnswersFetch}
            gradedQuestions={gradedQuestions}
            manualGradingQuestions={manualGradingQuestions}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeQuiz;
