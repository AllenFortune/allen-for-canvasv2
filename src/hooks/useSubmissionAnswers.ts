
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { SubmissionAnswer } from '@/types/quizGrading';

export const useSubmissionAnswers = (courseId: string | undefined, quizId: string | undefined) => {
  const { session } = useAuth();
  const [submissionAnswers, setSubmissionAnswers] = useState<{[submissionId: number]: SubmissionAnswer[]}>({});
  const [loadingAnswers, setLoadingAnswers] = useState<{[submissionId: number]: boolean}>({});
  const [answersErrors, setAnswersErrors] = useState<{[submissionId: number]: string}>({});
  const [fetchAttempts, setFetchAttempts] = useState<{[submissionId: number]: number}>({});

  const fetchSubmissionAnswers = async (submissionId: number, forceRefresh: boolean = false) => {
    if (!courseId || !quizId || !session?.access_token) {
      console.error('Missing required data for fetching submission answers');
      return null;
    }

    // Return cached answers if already loaded and not forcing refresh
    if (!forceRefresh && submissionAnswers[submissionId]) {
      console.log(`Returning cached answers for submission ${submissionId}:`, submissionAnswers[submissionId]);
      return submissionAnswers[submissionId];
    }

    // Check if we've already failed too many times
    const attempts = fetchAttempts[submissionId] || 0;
    const maxAttempts = 3;
    
    if (attempts >= maxAttempts && !forceRefresh) {
      console.log(`Max attempts reached for submission ${submissionId}`);
      return null;
    }

    console.log(`Fetching answers for submission ${submissionId}, attempt ${attempts + 1}`);
    setLoadingAnswers(prev => ({ ...prev, [submissionId]: true }));
    setAnswersErrors(prev => ({ ...prev, [submissionId]: '' }));

    try {
      const { data, error } = await supabase.functions.invoke(
        'get-canvas-quiz-submission-answers',
        {
          body: { courseId, quizId, submissionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw new Error(error.message || 'Failed to fetch submission answers');
      }

      console.log(`Raw response from edge function for submission ${submissionId}:`, data);

      const answers = data.answers || [];
      console.log(`Processed ${answers.length} answers for submission ${submissionId}:`, answers);
      
      setSubmissionAnswers(prev => ({ ...prev, [submissionId]: answers }));
      setAnswersErrors(prev => ({ ...prev, [submissionId]: '' }));
      setFetchAttempts(prev => ({ ...prev, [submissionId]: 0 })); // Reset attempts on success
      return answers;
    } catch (error) {
      console.error('Error fetching submission answers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch answers';
      setAnswersErrors(prev => ({ ...prev, [submissionId]: errorMessage }));
      setFetchAttempts(prev => ({ ...prev, [submissionId]: attempts + 1 }));
      return null;
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const retryAnswersFetch = (submissionId: number) => {
    console.log('Retrying answers fetch for submission:', submissionId);
    fetchSubmissionAnswers(submissionId, true);
  };

  return {
    submissionAnswers,
    loadingAnswers,
    answersErrors,
    fetchAttempts,
    fetchSubmissionAnswers,
    retryAnswersFetch
  };
};
