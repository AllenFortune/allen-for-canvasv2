
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Quiz, QuizQuestion, QuizSubmission } from '@/types/quizGrading';

// Track locally graded submissions to preserve status
interface LocalGradingState {
  [submissionId: number]: {
    [questionId: number]: boolean; // true if question has been graded locally
  };
}

export const useQuizData = (courseId: string | undefined, quizId: string | undefined) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [localGradingState, setLocalGradingState] = useState<LocalGradingState>({});

  const fetchQuizData = async () => {
    if (!courseId || !quizId || !session?.access_token) {
      setError('Missing course ID, quiz ID, or authentication');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching quiz data for:', { courseId, quizId });

      // Fetch quiz submissions
      const { data: submissionsData, error: submissionsError } = await supabase.functions.invoke(
        'get-canvas-quiz-submissions',
        {
          body: { courseId, quizId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (submissionsError) {
        throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
      }

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase.functions.invoke(
        'get-canvas-quiz-questions',
        {
          body: { courseId, quizId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (questionsError) {
        throw new Error(`Failed to fetch questions: ${questionsError.message}`);
      }

      console.log('Quiz data fetched successfully');
      setSubmissions(submissionsData.submissions || []);
      setQuiz(submissionsData.quiz || null);
      setQuestions(questionsData.questions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  const refreshSubmissions = async () => {
    if (!courseId || !quizId || !session?.access_token) {
      return;
    }

    try {
      console.log('Refreshing quiz submissions from Canvas...');
      
      const { data: submissionsData, error: submissionsError } = await supabase.functions.invoke(
        'get-canvas-quiz-submissions',
        {
          body: { courseId, quizId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (submissionsError) {
        throw new Error(`Failed to refresh submissions: ${submissionsError.message}`);
      }

      console.log('Quiz submissions refreshed from Canvas');
      
      // Smart merge: preserve local grading state
      const freshSubmissions = submissionsData.submissions || [];
      const mergedSubmissions = freshSubmissions.map((canvasSubmission: QuizSubmission) => {
        // If we have local grading state for this submission, preserve it
        const localState = localGradingState[canvasSubmission.id];
        if (localState && Object.keys(localState).length > 0) {
          // Check if all manual questions are graded locally
          const manualQuestions = questions.filter(q => 
            q.question_type === 'essay_question' || 
            q.question_type === 'fill_in_multiple_blanks_question' ||
            q.question_type === 'file_upload_question'
          );
          
          const allManualQuestionsGraded = manualQuestions.every(q => localState[q.id]);
          
          if (allManualQuestionsGraded && canvasSubmission.workflow_state !== 'graded') {
            // Preserve local "graded" status if all manual questions are graded
            return {
              ...canvasSubmission,
              workflow_state: 'graded'
            };
          }
        }
        return canvasSubmission;
      });

      setSubmissions(mergedSubmissions);
      setQuiz(submissionsData.quiz || null);
      return true;
    } catch (err) {
      console.error('Error refreshing submissions:', err);
      return false;
    }
  };

  const markQuestionAsGraded = (submissionId: number, questionId: number) => {
    setLocalGradingState(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [questionId]: true
      }
    }));
  };

  const retryFetch = () => {
    console.log('Retrying quiz data fetch...');
    setError(null);
    setLoading(true);
    fetchQuizData();
  };

  useEffect(() => {
    fetchQuizData();
  }, [courseId, quizId, session?.access_token]);

  return {
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
  };
};
