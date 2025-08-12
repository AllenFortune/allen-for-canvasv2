import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizAIGradingResponse {
  grade: number | null;
  feedback: string;
  gradeReview: string;
}

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

export const useQuizAIFeedback = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQuizFeedback = async (
    question: QuizQuestion,
    submissionAnswer: SubmissionAnswer,
    currentGrade?: string,
    isSummativeAssessment: boolean = true,
    customPrompt?: string
  ): Promise<QuizAIGradingResponse | null> => {
    if (!question || !submissionAnswer) {
      toast({
        title: "Error",
        description: "Missing question or answer data",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      console.log('Generating AI grading for quiz question:', question.id);

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          isQuizQuestion: true,
          questionText: question.question_text,
          questionType: question.question_type,
          questionName: question.question_name,
          studentAnswer: submissionAnswer.answer,
          pointsPossible: question.points_possible,
          currentGrade: currentGrade || null,
          isSummativeAssessment,
          customPrompt: customPrompt || null
        }
      });

      if (error) {
        console.error('Error generating AI quiz grading:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI grading. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data && (data.feedback || data.grade !== undefined)) {
        const assessmentType = isSummativeAssessment ? 'summative' : 'formative';
        const hasCustom = customPrompt && customPrompt.trim().length > 0;
        
        toast({
          title: "Success",
          description: `AI ${assessmentType} grading generated for quiz question!${hasCustom ? ' Custom instructions applied.' : ''}`,
        });
        
        return {
          grade: data.grade,
          feedback: data.feedback || '',
          gradeReview: data.gradeReview || ''
        };
      } else {
        throw new Error('No grading data received from AI');
      }
    } catch (error) {
      console.error('Error generating AI quiz grading:', error);
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
    generateQuizFeedback,
    isGenerating
  };
};