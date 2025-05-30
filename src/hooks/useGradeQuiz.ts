
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Quiz {
  id: number;
  title: string;
  description: string;
  points_possible: number;
  time_limit: number;
  allowed_attempts: number;
  quiz_type: string;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_name: string;
  question_text: string;
  question_type: string;
  points_possible: number;
  position: number;
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

export const useGradeQuiz = (courseId: string | undefined, quizId: string | undefined) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);

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

  const gradeQuestion = async (
    submissionId: number,
    questionId: number,
    score: string,
    comment: string
  ): Promise<boolean> => {
    if (!courseId || !quizId || !session?.access_token) {
      console.error('Missing required data for grading');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'grade-canvas-quiz-question',
        {
          body: {
            courseId,
            quizId,
            submissionId,
            questionId,
            score: parseFloat(score) || 0,
            comment,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Error grading question:', error);
        return false;
      }

      console.log('Question graded successfully:', data);
      return true;
    } catch (error) {
      console.error('Error grading question:', error);
      return false;
    }
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
    gradeQuestion,
    retryFetch,
    setSubmissions
  };
};
