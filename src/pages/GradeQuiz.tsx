
import React from 'react';
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
    loading,
    error,
    gradeQuestion,
    retryFetch,
    setSubmissions
  } = useGradeQuiz(courseId, quizId);

  if (!session) {
    return <LoadingDisplay />;
  }

  if (loading) {
    return <LoadingDisplay />;
  }

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
            setSubmissions={setSubmissions}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeQuiz;
