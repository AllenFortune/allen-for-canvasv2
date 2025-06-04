
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
      originalAssignment, 
      selectedSuggestions,
      assignmentTitle,
      subject,
      gradeLevel,
      estimatedTime
    } = await req.json();

    console.log('Generating revised assignment with selected suggestions:', selectedSuggestions.length);

    const systemPrompt = `You are an expert educational consultant specializing in AI literacy integration. Your task is to create a revised assignment description that seamlessly incorporates selected DIVER framework suggestions into the original assignment.

IMPORTANT: Respond with ONLY a plain text assignment description. Do not wrap your response in markdown code blocks or add any other formatting. Return the raw assignment text directly.

Guidelines:
- Maintain the original assignment's core learning objectives and content
- Integrate the selected DIVER suggestions naturally into the assignment structure
- Ensure the AI literacy components enhance rather than replace critical thinking
- Make the integration feel cohesive and purposeful
- Keep the assignment practical and achievable for the specified grade level
- Include clear instructions for students on how to use AI tools appropriately`;

    const selectedSuggestionsText = selectedSuggestions.map(suggestion => 
      `${suggestion.phase}: ${suggestion.title}
      ${suggestion.description}
      Activities: ${suggestion.activities.join(', ')}
      Examples: ${suggestion.examples.join(', ')}`
    ).join('\n\n');

    const userPrompt = `Original Assignment Title: ${assignmentTitle}
Original Assignment: ${originalAssignment}

Subject: ${subject || 'Not specified'}
Grade Level: ${gradeLevel || 'Not specified'}
Estimated Time: ${estimatedTime || 'Not specified'}

Selected DIVER Suggestions to Integrate:
${selectedSuggestionsText}

Please create a revised assignment description that naturally incorporates these selected AI literacy elements while maintaining the original assignment's educational goals. The revised assignment should be clear, engaging, and provide specific guidance on how students should use AI tools appropriately.`;

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
    let revisedAssignment = data.choices[0].message.content;

    console.log('Successfully generated revised assignment');

    return new Response(JSON.stringify({ revisedAssignment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-revised-assignment function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate revised assignment', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
