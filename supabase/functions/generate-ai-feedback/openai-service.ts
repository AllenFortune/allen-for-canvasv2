
import { OPENAI_CONFIG, getOpenAIApiKey } from './config.ts';

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const callOpenAI = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const openAIApiKey = getOpenAIApiKey();
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0].message.content;
};

export const parseAIResponse = (aiResponseContent: string, isSummativeAssessment: boolean) => {
  // Clean up potential markdown wrapping
  let cleanedContent = aiResponseContent.trim();
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Parse the JSON response from AI
  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', cleanedContent);
    // Create a more helpful fallback response
    const fallbackType = isSummativeAssessment ? 'comprehensive evaluation with leniency buffer' : 'developmental feedback with generous assessment';
    const assessmentType = isSummativeAssessment ? 'summative assessment' : 'formative assessment';
    
    return {
      grade: null,
      feedback: `I encountered an issue while generating your ${fallbackType}. Please try again, and I'll provide you with detailed ${isSummativeAssessment ? 'summative assessment with 10% leniency consideration' : 'formative guidance with encouraging assessment'} on your submission.`,
      strengths: ["Your submission was received and reviewed"],
      areasForImprovement: ["Please resubmit for detailed feedback"],
      summary: `Technical issue occurred during ${assessmentType} generation with leniency buffer. Please try again for personalized comments.`,
      gradeReview: "Technical error occurred while generating grade review. Please try the AI grading again to get detailed assessment breakdown for teacher verification."
    };
  }
};
