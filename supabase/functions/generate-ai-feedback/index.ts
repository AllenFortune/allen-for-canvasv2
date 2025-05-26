
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      submissionContent, 
      assignmentName, 
      assignmentDescription, 
      pointsPossible,
      currentGrade 
    } = await req.json();

    console.log('Generating AI feedback for assignment:', assignmentName);

    const systemPrompt = `You are an experienced educator providing constructive feedback on student assignments. Your feedback should be:

1. Constructive and encouraging
2. Specific about what the student did well
3. Clear about areas for improvement
4. Actionable with specific suggestions
5. Appropriate for the assignment type and level
6. Professional but warm in tone

Focus on both content quality and any specific requirements mentioned in the assignment description.`;

    const userPrompt = `Please provide detailed feedback for this student submission:

Assignment: ${assignmentName}
Points Possible: ${pointsPossible}
Current Grade: ${currentGrade || 'Not yet graded'}

Assignment Description:
${assignmentDescription || 'No description provided'}

Student Submission:
${submissionContent || 'No content provided'}

Please provide comprehensive feedback that highlights strengths, identifies areas for improvement, and offers specific suggestions for enhancement.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    console.log('AI feedback generated successfully');

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate AI feedback', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
