
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
      useRubric = false,
      isSummativeAssessment = true
    } = await req.json();

    console.log('Generating comprehensive AI grading for assignment:', assignmentName);
    console.log('Using rubric for grading:', useRubric);
    console.log('Assessment type:', isSummativeAssessment ? 'Summative' : 'Formative');

    // Adjust system prompt based on assessment type
    const assessmentInstructions = isSummativeAssessment 
      ? `You are an experienced educator providing comprehensive SUMMATIVE grading and feedback directly to a student on their assignment submission. This is a final evaluation that will determine their grade. Your response should be thorough, evaluative, and written in a professional yet encouraging tone as if you're speaking directly to the student about their final performance.

Focus on:
- Overall achievement and mastery demonstration
- How well learning objectives were met
- Comprehensive evaluation of strengths and areas that needed improvement
- Final performance assessment with clear justification for the grade
- Recognition of accomplishments and constructive guidance for future work`
      
      : `You are an experienced educator providing FORMATIVE feedback directly to a student on their assignment submission. This is developmental feedback focused on learning and improvement rather than final evaluation. Your response should be encouraging, growth-oriented, and written in a supportive tone as if you're guiding the student's learning journey.

Focus on:
- Learning progress and growth opportunities
- Specific actionable steps for improvement
- Encouragement and motivation for continued learning
- Identifying strengths to build upon
- Constructive guidance that promotes deeper understanding
- Less emphasis on final grading, more on learning development`;

    const systemPrompt = `${assessmentInstructions}

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
    const assessmentType = isSummativeAssessment ? 'summative assessment' : 'formative assessment';

    // Adjust the user prompt based on assessment type
    const gradeInstructions = isSummativeAssessment 
      ? `Please provide a comprehensive summative evaluation with a suggested grade (as a number out of ${pointsPossible}) based on the ${gradingMode}. This should reflect the student's final achievement level and mastery demonstration.`
      : `Please provide formative feedback with developmental guidance. ${pointsPossible > 0 ? `If appropriate, suggest a grade (as a number out of ${pointsPossible}) to indicate current progress level, but focus primarily on growth and improvement opportunities.` : 'Focus on learning progress rather than final grading.'}`;

    const feedbackInstructions = isSummativeAssessment
      ? `Provide comprehensive evaluation feedback that:
- Clearly explains the final grade and what it represents
- Acknowledges accomplishments and areas of strength
- Identifies specific areas where improvement was needed
- Offers constructive guidance for future assignments
- Maintains an encouraging tone while being thoroughly evaluative`
      : `Provide developmental feedback that:
- Celebrates learning progress and effort
- Identifies specific strengths to build upon
- Offers clear, actionable steps for improvement
- Encourages continued learning and growth
- Focuses on the learning process rather than just the final product`;

    const userPrompt = `Please analyze this student submission and provide ${assessmentType} feedback based on the ${gradingMode}:

Assignment: ${assignmentName}
Points Possible: ${pointsPossible}
${currentGrade ? `Current Grade: ${currentGrade}` : 'Not yet graded'}

${gradingCriteria}

Student Submission:
${submissionContent || 'No content provided'}

${gradeInstructions}

${feedbackInstructions}

Please provide:
1. ${isSummativeAssessment ? 'A final grade with clear justification' : 'Developmental feedback with optional progress indicator'}
2. Detailed feedback written directly to the student in paragraph form
3. 3-5 specific strengths of the submission
4. 3-5 specific areas for improvement with actionable suggestions
5. A brief summary (2-3 sentences) of the ${isSummativeAssessment ? 'overall evaluation' : 'learning progress and next steps'}

${useRubric && rubric ? 
  `Focus your ${assessmentType} on how well the submission meets each rubric criterion. Reference specific rubric elements in your feedback.` :
  `Focus your ${assessmentType} on how well the submission addresses the assignment requirements and objectives.`
}

Write the feedback as if you're having a conversation with the student. Use "you" and "your" language. Be specific, encouraging, and constructive. ${isSummativeAssessment ? 'Provide thorough evaluation while maintaining an encouraging tone.' : 'Focus on growth, learning, and actionable next steps.'}`;

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
      const fallbackType = isSummativeAssessment ? 'comprehensive evaluation' : 'developmental feedback';
      parsedResponse = {
        grade: null,
        feedback: `I encountered an issue while generating your ${fallbackType}. Please try again, and I'll provide you with detailed ${isSummativeAssessment ? 'summative assessment' : 'formative guidance'} on your submission.`,
        strengths: ["Your submission was received and reviewed"],
        areasForImprovement: ["Please resubmit for detailed feedback"],
        summary: `Technical issue occurred during ${assessmentType} generation. Please try again for personalized comments.`
      };
    }

    console.log('AI grading generated successfully using:', gradingMode, 'for', assessmentType);

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
