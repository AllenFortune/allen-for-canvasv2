import { supabase } from '@/integrations/supabase/client';
import { RubricData } from '@/types/rubric';

export interface AIRubricRequest {
  assignmentContent: string;
  rubricType: 'analytic' | 'holistic' | 'single_point';
  pointsPossible: number;
  subjectArea?: string;
  gradeLevel?: string;
  includeDiverAlignment?: boolean;
  customPrompt?: string;
}

export interface AIRubricResponse {
  success: boolean;
  rubric?: RubricData;
  error?: string;
}

class AIRubricService {
  async generateRubric(request: AIRubricRequest): Promise<RubricData> {
    const { data, error } = await supabase.functions.invoke('generate-ai-rubric', {
      body: request
    });

    if (error) {
      throw new Error(`AI rubric generation failed: ${error.message}`);
    }

    if (!data?.criteria) {
      throw new Error('Invalid rubric data received from AI service');
    }

    return data;
  }

  async validateRubricData(rubric: RubricData): Promise<boolean> {
    // Basic validation
    if (!rubric.title || !rubric.criteria || rubric.criteria.length === 0) {
      return false;
    }

    // Validate each criterion
    for (const criterion of rubric.criteria) {
      if (!criterion.name || !criterion.levels || criterion.levels.length === 0) {
        return false;
      }

      // Validate each level
      for (const level of criterion.levels) {
        if (!level.name || level.points === undefined) {
          return false;
        }
      }
    }

    return true;
  }

  async retryGeneration(request: AIRubricRequest, maxRetries = 3): Promise<RubricData> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const rubric = await this.generateRubric(request);
        
        if (await this.validateRubricData(rubric)) {
          return rubric;
        } else {
          throw new Error('Generated rubric failed validation');
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Rubric generation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Rubric generation failed after all retries');
  }
}

export const aiRubricService = new AIRubricService();