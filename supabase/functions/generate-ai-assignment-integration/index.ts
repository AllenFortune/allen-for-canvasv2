
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

CRITICAL: Students must always start with their own thinking before using AI. AI should amplify learning, not replace critical thinking.

IMPORTANT: Respond with ONLY a valid JSON object. Do not wrap your response in markdown code blocks or add any other formatting. Return the raw JSON object directly.

The JSON should contain:
- overview: A brief overview of how AI can enhance this assignment while maintaining student agency
- suggestions: An array of 5 objects (one for each DIVER phase) with:
  - phase: The DIVER phase name
  - title: A concise title for this phase's integration
  - description: How this phase applies to the assignment
  - activities: Array of 3-4 specific activities students can do
  - examples: Array of 2-3 concrete examples or prompts
  - studentAIPrompts: Array of 3-4 AI prompts that encourage students to start with their own thinking first
  - teachingTips: Array of 2-3 specific tips for educators on guiding responsible AI use in this phase
  - criticalThinkingQuestions: Array of 2-3 questions students should ask themselves when using AI
  - responsibleUseGuideline: A single guideline statement about ethical AI use for this phase
- implementation_guide: Step-by-step guide for teachers

For studentAIPrompts, create prompts that:
- Always require students to share their initial thoughts first
- Ask AI to help expand or challenge their thinking, not replace it
- Require students to synthesize AI input with their own ideas
- Promote critical evaluation of AI responses

Make all suggestions grade-appropriate and subject-specific.`;

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
    let generatedContent = data.choices[0].message.content;

    console.log('Raw OpenAI response:', generatedContent);

    // Strip markdown code blocks if present
    if (generatedContent.includes('```json')) {
      const jsonMatch = generatedContent.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        generatedContent = jsonMatch[1].trim();
      }
    } else if (generatedContent.includes('```')) {
      const codeMatch = generatedContent.match(/```\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        generatedContent = codeMatch[1].trim();
      }
    }

    // Parse the JSON response
    let integrationSuggestions;
    try {
      integrationSuggestions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', generatedContent);
      console.error('Parse error:', parseError.message);
      
      // Return a fallback response structure
      integrationSuggestions = {
        overview: "AI integration suggestions could not be generated due to a parsing error. Please try again with a different assignment.",
        suggestions: [
          {
            phase: "Discovery",
            title: "Error in AI Processing",
            description: "Please try submitting your assignment again.",
            activities: ["Retry the AI integration tool"],
            examples: ["Check your assignment content and try again"]
          }
        ],
        implementation_guide: "There was an error processing your request. Please try again or contact support if the issue persists."
      };
    }

    // Validate the response structure
    if (!integrationSuggestions.overview || !integrationSuggestions.suggestions || !Array.isArray(integrationSuggestions.suggestions)) {
      console.error('Invalid response structure:', integrationSuggestions);
      throw new Error('Invalid response structure from AI');
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
