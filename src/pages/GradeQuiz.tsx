
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
    setSubmissions,
    markQuestionAsGraded,
    localGradingState
  } = useGradeQuiz(courseId, quizId);

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

  // Enhanced grade update handler with local state tracking
  const handleGradeUpdate = (submissionId: number, score: string, questionId?: number) => {
    // Mark question as graded in local state
    if (questionId) {
      markQuestionAsGraded(submissionId, questionId);
    }

    // Check if all manual grading questions are now graded for this submission
    const manualQuestions = questions.filter(q => 
      q.question_type === 'essay_question' || 
      q.question_type === 'fill_in_multiple_blanks_question' ||
      q.question_type === 'file_upload_question'
    );

    const currentLocalState = localGradingState[submissionId] || {};
    const allManualQuestionsGraded = manualQuestions.every(q => 
      currentLocalState[q.id] || (questionId === q.id)
    );

    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          workflow_state: allManualQuestionsGraded ? 'graded' : submission.workflow_state,
          score: parseFloat(score) || submission.score
        };
      }
      return submission;
    });
    setSubmissions(updatedSubmissions);
  };

  // Create voice context for quiz grading
  const voiceContext = {
    quiz,
    questions,
    submissions,
    gradeQuestion,
    handleGradeUpdate,
    setSubmissions: handleSetSubmissions,
    submissionAnswers,
    // Add navigation functions
    students: submissions.map(s => ({
      id: s.user_id,
      name: s.user?.name || `User ${s.user_id}`,
      submissionId: s.id
    }))
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
            voiceContext={voiceContext}
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
            localGradingState={localGradingState}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeQuiz;
