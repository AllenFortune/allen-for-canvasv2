
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useQuizGrading = (
  courseId: string | undefined, 
  quizId: string | undefined,
  refreshSubmissions?: () => Promise<boolean>
) => {
  const { session } = useAuth();

  const gradeQuestion = async (
    submissionId: number,
    questionId: number,
    score: string,
    comment: string,
    userId?: number
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
            userId,
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
      
      // Refresh submissions from Canvas after successful grading
      if (refreshSubmissions) {
        setTimeout(() => {
          refreshSubmissions();
        }, 1000); // Small delay to allow Canvas to process the grade
      }
      
      return true;
    } catch (error) {
      console.error('Error grading question:', error);
      return false;
    }
  };

  return {
    gradeQuestion
  };
};
