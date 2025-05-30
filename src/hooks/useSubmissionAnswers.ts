
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
      const debugInfo = data.debug_info || {};
      
      console.log(`Processed ${answers.length} answers for submission ${submissionId}:`, answers);
      console.log(`Debug info:`, debugInfo);
      
      // Log answers with content for debugging
      const answersWithContent = answers.filter((a: SubmissionAnswer) => 
        a.answer !== null && 
        a.answer !== undefined && 
        a.answer !== '' &&
        (typeof a.answer !== 'string' || a.answer.trim() !== '')
      );
      
      console.log(`Found ${answersWithContent.length}/${answers.length} answers with actual content`);
      
      if (answersWithContent.length === 0 && answers.length > 0) {
        console.warn('All answers are empty - this may indicate a Canvas API extraction issue');
      }
      
      setSubmissionAnswers(prev => ({ ...prev, [submissionId]: answers }));
      setAnswersErrors(prev => ({ ...prev, [submissionId]: '' }));
      setFetchAttempts(prev => ({ ...prev, [submissionId]: 0 })); // Reset attempts on success
      return answers;
    } catch (error) {
      console.error('Error fetching submission answers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch answers';
      
      // Provide more specific error guidance
      let enhancedErrorMessage = errorMessage;
      if (errorMessage.includes('404')) {
        enhancedErrorMessage = 'Quiz submission not found. The student may not have submitted this quiz yet.';
      } else if (errorMessage.includes('403')) {
        enhancedErrorMessage = 'Access denied. Please check your Canvas permissions for this quiz.';
      } else if (errorMessage.includes('Canvas credentials')) {
        enhancedErrorMessage = 'Canvas credentials not configured. Please check your Canvas integration settings.';
      }
      
      setAnswersErrors(prev => ({ ...prev, [submissionId]: enhancedErrorMessage }));
      setFetchAttempts(prev => ({ ...prev, [submissionId]: attempts + 1 }));
      return null;
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const retryAnswersFetch = (submissionId: number) => {
    console.log('Retrying answers fetch for submission:', submissionId);
    // Clear any existing error and reset attempts for forced retry
    setAnswersErrors(prev => ({ ...prev, [submissionId]: '' }));
    setFetchAttempts(prev => ({ ...prev, [submissionId]: 0 }));
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
