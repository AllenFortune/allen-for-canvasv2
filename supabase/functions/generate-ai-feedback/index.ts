
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
      rubric,
      useRubric = false
    } = await req.json();

    console.log('Generating comprehensive AI grading for assignment:', assignmentName);
    console.log('Using rubric for grading:', useRubric);

    const systemPrompt = `You are an experienced educator providing comprehensive grading and feedback directly to a student on their assignment submission. Your response should be encouraging, constructive, and written in a conversational tone as if you're speaking directly to the student.

You MUST format your response ONLY as a valid JSON object with the following structure:
{
  "grade": number,
  "feedback": "string - write this as a cohesive paragraph directed to the student, combining strengths and areas for improvement in a natural, encouraging way",
  "strengths": ["string", "string", ...],
  "areasForImprovement": ["string", "string", ...],
  "summary": "string"
}

The feedback field should be written as if you're talking directly to the student - use "you" and "your" language. Make it sound natural and encouraging while being educational and specific.

Do not include any explanations, markdown formatting, or text outside of this JSON structure.`;

    // Determine which grading criteria to use
    const gradingCriteria = useRubric && rubric 
      ? `Rubric Criteria: ${rubric}`
      : `Assignment Description: ${assignmentDescription || 'No description provided'}`;

    const gradingMode = useRubric && rubric ? 'rubric criteria' : 'assignment description';

    const userPrompt = `Please analyze this student submission and provide comprehensive grading based on the ${gradingMode}:

Assignment: ${assignmentName}
Points Possible: ${pointsPossible}
${currentGrade ? `Current Grade: ${currentGrade}` : 'Not yet graded'}

${gradingCriteria}

Student Submission:
${submissionContent || 'No content provided'}

Please provide:
1. A suggested grade (as a number out of ${pointsPossible}) based on the ${gradingMode}
2. Detailed feedback written directly to the student in paragraph form, combining strengths and areas for improvement naturally
3. 3-5 specific strengths of the submission
4. 3-5 specific areas for improvement with actionable suggestions
5. A brief summary (2-3 sentences) of the overall submission quality

${useRubric && rubric ? 
  'Focus your grading on how well the submission meets each rubric criterion. Reference specific rubric elements in your feedback.' :
  'Focus your grading on how well the submission addresses the assignment requirements and objectives.'
}

Write the feedback as if you're having a conversation with the student. Use "you" and "your" language. Be specific, encouraging, and constructive. Combine praise for what they did well with clear guidance on how to improve, all in a natural flowing paragraph.`;

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
    let aiResponseContent = data.choices[0].message.content;

    // Clean up potential markdown wrapping
    aiResponseContent = aiResponseContent.trim();
    if (aiResponseContent.startsWith('```json')) {
      aiResponseContent = aiResponseContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (aiResponseContent.startsWith('```')) {
      aiResponseContent = aiResponseContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponseContent);
      // Create a more helpful fallback response
      parsedResponse = {
        grade: null,
        feedback: "I encountered an issue while generating your detailed feedback. Please try again, and I'll provide you with comprehensive comments on your submission.",
        strengths: ["Your submission was received and reviewed"],
        areasForImprovement: ["Please resubmit for detailed feedback"],
        summary: "Technical issue occurred during feedback generation. Please try again for personalized comments."
      };
    }

    console.log('AI grading generated successfully using:', gradingMode);

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
