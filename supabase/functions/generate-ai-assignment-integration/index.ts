
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
      assignmentTitle, 
      assignmentText, 
      subject, 
      gradeLevel, 
      estimatedTime 
    } = await req.json();

    console.log('Generating AI assignment integration for:', assignmentTitle);

    const systemPrompt = `You are an expert educational consultant specializing in AI literacy integration using the DIVER framework. The DIVER framework consists of five phases:

1. Discovery: Encouraging exploration and multiple perspectives
2. Interaction & Collaboration: Peer activities and discussion
3. Verification: Critical evaluation and fact-checking
4. Editing & Iteration: Revision and personal ownership
5. Reflection: Metacognitive awareness and growth

Your task is to analyze assignments and provide specific, actionable suggestions for integrating AI literacy while maintaining academic integrity and promoting deep learning.

Respond with a JSON object containing:
- overview: A brief overview of how AI can enhance this assignment
- suggestions: An array of 5 objects (one for each DIVER phase) with:
  - phase: The DIVER phase name
  - title: A concise title for this phase's integration
  - description: How this phase applies to the assignment
  - activities: Array of 3-4 specific activities students can do
  - examples: Array of 2-3 concrete examples or prompts
- implementation_guide: Step-by-step guide for teachers

Make suggestions grade-appropriate and subject-specific.`;

    const userPrompt = `Assignment Title: ${assignmentTitle}

Assignment Content: ${assignmentText}

Subject: ${subject || 'Not specified'}
Grade Level: ${gradeLevel || 'Not specified'}
Estimated Time: ${estimatedTime || 'Not specified'}

Please provide specific AI literacy integration suggestions using the DIVER framework for this assignment.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the JSON response
    let integrationSuggestions;
    try {
      integrationSuggestions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', generatedContent);
      throw new Error('Failed to parse AI response');
    }

    console.log('Successfully generated AI assignment integration');

    return new Response(JSON.stringify(integrationSuggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-assignment-integration function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate AI assignment integration', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
