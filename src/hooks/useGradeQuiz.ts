
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
    setSubmissions
  } = useQuizData(courseId, quizId);

  const {
    submissionAnswers,
    loadingAnswers,
    answersErrors,
    fetchAttempts,
    fetchSubmissionAnswers,
    retryAnswersFetch
  } = useSubmissionAnswers(courseId, quizId);

  const { gradeQuestion } = useQuizGrading(courseId, quizId);

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
    setSubmissions
  };
};
