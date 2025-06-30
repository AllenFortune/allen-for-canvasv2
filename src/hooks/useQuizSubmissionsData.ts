
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface QuizSubmissionSummary {
  quizId: number;
  totalSubmissions: number;
  needsGrading: number;
  graded: number;
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

      const { data, error: submissionError } = await supabase.functions.invoke(
        'get-canvas-quiz-submissions',
        {
          body: { courseId, quizId: quizId.toString() },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (submissionError) {
        throw new Error(`Failed to fetch submissions for quiz ${quizId}: ${submissionError.message}`);
      }

      const submissionsList = data?.submissions || [];
      
      // Calculate grading statistics
      const needsGrading = submissionsList.filter((s: any) => 
        s.workflow_state === 'complete' || s.workflow_state === 'pending_review'
      ).length;
      
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
          loading: false,
          error: null
        }
      }));

    } catch (err) {
      console.error(`Error fetching submissions for quiz ${quizId}:`, err);
      setSubmissions(prev => ({
        ...prev,
        [quizId]: {
          quizId,
          totalSubmissions: 0,
          needsGrading: 0,
          graded: 0,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch submissions'
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
