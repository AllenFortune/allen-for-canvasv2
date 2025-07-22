
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
      estimatedTime,
      classFormat,
      assignmentType,
      completionLocation
    } = await req.json();

    console.log('Generating AI assignment integration for:', assignmentTitle);

    // Build contextual information for the AI prompt
    const contextInfo = [];
    if (classFormat) contextInfo.push(`Class Format: ${classFormat === 'online' ? 'Online Class' : 'In-Person Class'}`);
    if (assignmentType) contextInfo.push(`Type: ${assignmentType === 'discussion' ? 'Discussion' : 'Assignment'}`);
    if (completionLocation) contextInfo.push(`Location: ${completionLocation === 'in-class' ? 'In-Class' : 'Outside Class'}`);

    const contextString = contextInfo.length > 0 ? `\n\nContextual Information:\n${contextInfo.join('\n')}` : '';

    const systemPrompt = `You are an expert educational consultant specializing in AI literacy integration using the DIVER framework. The DIVER framework consists of five phases:

1. Discovery: Encouraging exploration and multiple perspectives
2. Interaction & Collaboration: Peer activities and discussion
3. Verification: Critical evaluation and fact-checking
4. Editing & Iteration: Revision and personal ownership
5. Reflection: Metacognitive awareness and growth

Your task is to analyze assignments and provide specific, actionable suggestions for integrating AI literacy while maintaining academic integrity and promoting deep learning.

CRITICAL: Students must always start with their own thinking before using AI. AI should amplify learning, not replace critical thinking.

CONTEXTUAL ADAPTATION RULES:
- **Online Discussion**: Emphasize asynchronous peer interaction, initial posts followed by responses to classmates (typically 2+ responses), forum-based collaboration
- **In-Person Discussion**: Focus on real-time classroom activities, face-to-face group discussions, immediate peer feedback and sharing
- **In-Class Assignment**: Collaborative activities during class time, peer review sessions, group work with AI assistance
- **Outside Class Assignment**: Individual reflection and independent work, personal AI interaction, self-directed learning with minimal peer collaboration

IMPORTANT: Respond with ONLY a valid JSON object. Do not wrap your response in markdown code blocks or add any other formatting. Return the raw JSON object directly.

The JSON should contain:
- overview: A brief overview of how AI can enhance this assignment while maintaining student agency (adapt based on context)
- suggestions: An array of 5 objects (one for each DIVER phase) with:
  - phase: The DIVER phase name
  - title: A concise title for this phase's integration
  - description: How this phase applies to the assignment (context-aware)
  - activities: Array of 3-4 specific activities students can do (adapted for the specific context)
  - examples: Array of 2-3 concrete examples or prompts (context-specific)
  - studentAIPrompts: Array of 3-4 AI prompts that encourage students to start with their own thinking first (adapted for context)
  - teachingTips: Array of 2-3 specific tips for educators on guiding responsible AI use in this phase (context-aware)
  - criticalThinkingQuestions: Array of 2-3 questions students should ask themselves when using AI (context-relevant)
  - responsibleUseGuideline: A single guideline statement about ethical AI use for this phase (context-appropriate)
- implementation_guide: Step-by-step guide for teachers (adapted for the specific context)

For studentAIPrompts, create prompts that:
- Always require students to share their initial thoughts first
- Ask AI to help expand or challenge their thinking, not replace it
- Require students to synthesize AI input with their own ideas
- Promote critical evaluation of AI responses
- Are appropriate for the specific context (online vs in-person, discussion vs assignment, in-class vs outside)

Make all suggestions grade-appropriate, subject-specific, and context-aware.`;

    const userPrompt = `Assignment Title: ${assignmentTitle}

Assignment Content: ${assignmentText}

Subject: ${subject || 'Not specified'}
Grade Level: ${gradeLevel || 'Not specified'}
Estimated Time: ${estimatedTime || 'Not specified'}${contextString}

Please provide specific AI literacy integration suggestions using the DIVER framework for this assignment, taking into account the contextual information provided.`;

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
            examples: ["Check your assignment content and try again"],
            studentAIPrompts: ["Please retry your request"],
            teachingTips: ["Contact support if this error persists"],
            criticalThinkingQuestions: ["Is the assignment content clear and complete?"],
            responsibleUseGuideline: "Always verify that your assignment information is complete before submitting."
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
