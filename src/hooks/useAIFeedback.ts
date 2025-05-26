
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assignment, Submission } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';

export const useAIFeedback = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateFeedback = async (
    submission: Submission,
    assignment: Assignment | null,
    currentGrade?: string
  ): Promise<string | null> => {
    if (!submission || !assignment) {
      toast({
        title: "Error",
        description: "Missing submission or assignment data",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      console.log('Generating AI feedback for submission:', submission.id);

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          submissionContent: submission.body || 'No text content provided',
          assignmentName: assignment.name,
          assignmentDescription: assignment.description,
          pointsPossible: assignment.points_possible,
          currentGrade: currentGrade || null
        }
      });

      if (error) {
        console.error('Error generating AI feedback:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI feedback. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data?.feedback) {
        toast({
          title: "Success",
          description: "AI feedback generated successfully!",
        });
        return data.feedback;
      } else {
        throw new Error('No feedback received from AI');
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating feedback.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateFeedback,
    isGenerating
  };
};
