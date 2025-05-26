
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assignment, Submission } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';

export interface AIGradingResponse {
  grade: number | null;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  summary: string;
}

export const useAIFeedback = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateComprehensiveFeedback = async (
    submission: Submission,
    assignment: Assignment | null,
    currentGrade?: string
  ): Promise<AIGradingResponse | null> => {
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
      console.log('Generating comprehensive AI grading for submission:', submission.id);

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          submissionContent: submission.body || 'No text content provided',
          assignmentName: assignment.name,
          assignmentDescription: assignment.description,
          pointsPossible: assignment.points_possible,
          currentGrade: currentGrade || null,
          rubric: assignment.rubric ? JSON.stringify(assignment.rubric) : null
        }
      });

      if (error) {
        console.error('Error generating AI grading:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI grading. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data && (data.feedback || data.grade !== undefined)) {
        toast({
          title: "Success",
          description: "AI grading generated successfully!",
        });
        return {
          grade: data.grade,
          feedback: data.feedback || '',
          strengths: data.strengths || [],
          areasForImprovement: data.areasForImprovement || [],
          summary: data.summary || ''
        };
      } else {
        throw new Error('No grading data received from AI');
      }
    } catch (error) {
      console.error('Error generating AI grading:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating grading.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateComprehensiveFeedback,
    isGenerating
  };
};
