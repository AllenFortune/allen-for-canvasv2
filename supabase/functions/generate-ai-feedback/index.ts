
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
      currentGrade,
      rubric
    } = await req.json();

    console.log('Generating comprehensive AI grading for assignment:', assignmentName);

    const systemPrompt = `You are an experienced educator providing comprehensive grading and feedback on student assignments. Your response should be constructive, encouraging, and educational.

You MUST format your response ONLY as a valid JSON object with the following structure:
{
  "grade": number,
  "feedback": "string",
  "strengths": ["string", "string", ...],
  "areasForImprovement": ["string", "string", ...],
  "summary": "string"
}

Do not include any explanations or text outside of this JSON structure.`;

    const userPrompt = `Please analyze this student submission and provide comprehensive grading:

Assignment: ${assignmentName}
Points Possible: ${pointsPossible}
${currentGrade ? `Current Grade: ${currentGrade}` : 'Not yet graded'}

Assignment Description:
${assignmentDescription || 'No description provided'}

${rubric ? `Rubric Criteria: ${rubric}` : ''}

Student Submission:
${submissionContent || 'No content provided'}

Please provide:
1. A suggested grade (as a number out of ${pointsPossible})
2. Detailed feedback explaining the grade and offering constructive guidance
3. 3-5 specific strengths of the submission
4. 3-5 specific areas for improvement with actionable suggestions
5. A brief summary (2-3 sentences) of the overall submission quality

Ensure your feedback is:
- Constructive and encouraging
- Specific with examples from the submission
- Educational and actionable
- Appropriate for the assignment level
- Professional but warm in tone`;

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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponseContent = data.choices[0].message.content;

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponseContent);
      // Fallback response if JSON parsing fails
      parsedResponse = {
        grade: null,
        feedback: aiResponseContent,
        strengths: ["AI response could not be parsed properly"],
        areasForImprovement: ["Please try generating feedback again"],
        summary: "There was an issue processing the AI response."
      };
    }

    console.log('AI grading generated successfully');

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate AI grading', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
