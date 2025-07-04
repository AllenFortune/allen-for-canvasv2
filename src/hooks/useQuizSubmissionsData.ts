
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface QuizSubmissionSummary {
  quizId: number;
  totalSubmissions: number;
  needsGrading: number;
  graded: number;
  autoGraded: number;
  hasManualGradingQuestions: boolean;
  loading: boolean;
  error: string | null;
}

export const useQuizSubmissionsData = (courseId: string | undefined, quizIds: number[]) => {
  const { session } = useAuth();
  const [submissions, setSubmissions] = useState<{ [quizId: number]: QuizSubmissionSummary }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizSubmissions = async (quizId: number) => {
    if (!courseId || !session?.access_token) return;

    try {
      // Set loading state for this specific quiz
      setSubmissions(prev => ({
        ...prev,
        [quizId]: {
          ...prev[quizId],
          loading: true,
          error: null
        } as QuizSubmissionSummary
      }));

      // Fetch both submissions and questions in parallel
      const [submissionsResponse, questionsResponse] = await Promise.all([
        supabase.functions.invoke(
          'get-canvas-quiz-submissions',
          {
            body: { courseId, quizId: quizId.toString() },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        ),
        supabase.functions.invoke(
          'get-canvas-quiz-questions',
          {
            body: { courseId, quizId: quizId.toString() },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )
      ]);

      if (submissionsResponse.error) {
        throw new Error(`Failed to fetch submissions for quiz ${quizId}: ${submissionsResponse.error.message}`);
      }

      if (questionsResponse.error) {
        throw new Error(`Failed to fetch questions for quiz ${quizId}: ${questionsResponse.error.message}`);
      }

      const submissionsList = submissionsResponse.data?.submissions || [];
      const questionsList = questionsResponse.data?.questions || [];
      
      // Check if quiz has manual grading questions
      const hasManualGradingQuestions = questionsList.some((q: any) => 
        q.question_type === 'essay_question' || 
        q.question_type === 'fill_in_multiple_blanks_question' ||
        q.question_type === 'file_upload_question'
      );
      
      // Calculate grading statistics with intelligent logic
      const needsGrading = hasManualGradingQuestions 
        ? submissionsList.filter((s: any) => 
            s.workflow_state === 'complete' || s.workflow_state === 'pending_review'
          ).length
        : 0;
      
      const autoGraded = !hasManualGradingQuestions 
        ? submissionsList.filter((s: any) => 
            s.workflow_state === 'complete' && s.score !== null
          ).length
        : 0;
      
      const graded = submissionsList.filter((s: any) => 
        s.workflow_state === 'graded' && s.score !== null
      ).length;

      setSubmissions(prev => ({
        ...prev,
        [quizId]: {
          quizId,
          totalSubmissions: submissionsList.length,
          needsGrading,
          graded,
          autoGraded,
          hasManualGradingQuestions,
          loading: false,
          error: null
        }
      }));

    } catch (err) {
      console.error(`Error fetching data for quiz ${quizId}:`, err);
      setSubmissions(prev => ({
        ...prev,
        [quizId]: {
          quizId,
          totalSubmissions: 0,
          needsGrading: 0,
          graded: 0,
          autoGraded: 0,
          hasManualGradingQuestions: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch quiz data'
        }
      }));
    }
  };

  const fetchAllSubmissions = async () => {
    if (!courseId || !session?.access_token || quizIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch submissions for all quizzes in parallel, but with a small delay to avoid rate limiting
      for (let i = 0; i < quizIds.length; i++) {
        if (i > 0) {
          // Small delay between requests to be respectful to Canvas API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await fetchQuizSubmissions(quizIds[i]);
      }
    } catch (err) {
      console.error('Error fetching quiz submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizIds.length > 0) {
      fetchAllSubmissions();
    }
  }, [courseId, quizIds.join(','), session?.access_token]);

  return {
    submissions: Object.values(submissions),
    submissionsMap: submissions,
    loading,
    error,
    refetch: fetchAllSubmissions
  };
};
