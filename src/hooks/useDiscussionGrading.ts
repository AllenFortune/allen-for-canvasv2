
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiscussionGrade } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';
import { UseDiscussionGradingReturn } from '@/types/discussionGrading';

export const useDiscussionGrading = (courseId?: string, discussionId?: string): UseDiscussionGradingReturn => {
  const [grades, setGrades] = useState<DiscussionGrade[]>([]);
  const { toast } = useToast();

  const saveGrade = async (userId: number, grade: string, feedback: string, aiGradeReview?: string) => {
    if (!courseId || !discussionId) {
      console.error('Missing courseId or discussionId for saveGrade');
      toast({
        title: "Error",
        description: "Missing course or discussion information",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Saving grade for user:', { userId, grade, feedback, aiGradeReview });
      
      const { data, error } = await supabase.functions.invoke('grade-canvas-discussion-entry', {
        body: {
          courseId,
          discussionId,
          userId,
          grade,
          feedback,
          aiGradeReview
        }
      });

      if (error) {
        console.error('Error from grade-canvas-discussion-entry:', error);
        throw error;
      }

      console.log('Grade saved successfully:', data);

      // Update local grades state
      setGrades(prev => {
        const existing = prev.find(g => g.user_id === userId);
        if (existing) {
          return prev.map(g => 
            g.user_id === userId 
              ? { ...g, grade, score: parseFloat(grade), feedback, ai_grade_review: aiGradeReview }
              : g
          );
        } else {
          return [...prev, { 
            user_id: userId, 
            grade, 
            score: parseFloat(grade), 
            feedback, 
            ai_grade_review: aiGradeReview 
          }];
        }
      });

      toast({
        title: "Success",
        description: "Grade saved successfully!",
      });

      return true;
    } catch (err) {
      console.error('Error saving grade:', err);
      toast({
        title: "Error",
        description: "Failed to save grade. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    grades,
    saveGrade,
    setGrades
  };
};
