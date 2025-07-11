
import { useQuizData } from './useQuizData';
import { useSubmissionAnswers } from './useSubmissionAnswers';
import { useQuizGrading } from './useQuizGrading';

export const useGradeQuiz = (courseId: string | undefined, quizId: string | undefined) => {
  const {
    quiz,
    questions,
    submissions,
    loading,
    error,
    retryFetch,
    refreshSubmissions,
    setSubmissions,
    markQuestionAsGraded,
    localGradingState
  } = useQuizData(courseId, quizId);

  const {
    submissionAnswers,
    loadingAnswers,
    answersErrors,
    fetchAttempts,
    fetchSubmissionAnswers,
    retryAnswersFetch
  } = useSubmissionAnswers(courseId, quizId);

  const { gradeQuestion } = useQuizGrading(courseId, quizId, refreshSubmissions);

  return {
    quiz,
    questions,
    submissions,
    submissionAnswers,
    loadingAnswers,
    answersErrors,
    fetchAttempts,
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
  };
};
