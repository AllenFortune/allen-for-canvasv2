import { useState, useCallback } from 'react';
import { aiRubricService, AIRubricRequest } from '@/services/aiRubricService';
import { RubricData } from '@/types/rubric';
import { useToast } from '@/hooks/use-toast';

export const useRubricGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateRubric = useCallback(async (request: AIRubricRequest): Promise<RubricData | null> => {
    setIsGenerating(true);
    try {
      console.log('Generating rubric with params:', request);

      const rubric = await aiRubricService.retryGeneration(request);

      toast({
        title: "Success",
        description: "AI rubric generated successfully!"
      });

      return rubric;
    } catch (error) {
      console.error('Error generating rubric:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error",
        description: `Failed to generate rubric: ${errorMessage}`,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const regenerateRubric = useCallback(async (request: AIRubricRequest): Promise<RubricData | null> => {
    // Add a slight modification to prompt for variation
    const modifiedRequest = {
      ...request,
      customPrompt: request.customPrompt 
        ? `${request.customPrompt}\n\nPlease provide a fresh perspective on this rubric.`
        : 'Please create a detailed and comprehensive rubric with fresh perspectives.'
    };

    return generateRubric(modifiedRequest);
  }, [generateRubric]);

  return {
    isGenerating,
    generateRubric,
    regenerateRubric
  };
};