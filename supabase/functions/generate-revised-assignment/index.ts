
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

    const systemPrompt = `You are an expert educational consultant specializing in AI literacy integration using the DIVER framework. Your task is to create a comprehensive, structured assignment that seamlessly integrates the selected DIVER framework components.

IMPORTANT: Respond with ONLY a plain text assignment description. Do not wrap your response in markdown code blocks or add any other formatting. Return the raw assignment text directly.

DIVER Framework Structure:
- **Discovery**: Exploration and research phase with AI-assisted inquiry
- **Interaction & Collaboration**: Discussion and peer engagement phase
- **Verification**: Critical evaluation and fact-checking phase
- **Editing & Iteration**: Revision and improvement phase with AI assistance
- **Reflection**: Metacognitive assessment and learning synthesis phase

Assignment Requirements:
1. Create a comprehensive assignment organized by DIVER phases
2. Include clear section headings for each selected phase
3. Integrate selected AI prompts with specific instructions for students
4. Include critical thinking questions throughout each phase
5. Embed responsible use guidelines for AI tools
6. Provide clear assessment criteria and expectations
7. Include time estimates and milestones for each phase
8. Ensure smooth transitions between phases
9. Maintain the original assignment's core learning objectives
10. Format for easy student comprehension and execution

For each DIVER phase included:
- Start with a clear phase header and objective
- List specific activities students should complete
- Include selected AI prompts with usage instructions
- Add critical thinking questions for reflection
- Include responsible AI use guidelines
- Provide assessment criteria for the phase
- Suggest time allocation

The final assignment should read as a cohesive, structured learning experience that guides students through the DIVER framework while maintaining academic rigor and promoting responsible AI use.`;

    const selectedSuggestionsText = selectedSuggestions.map(suggestion => {
      const selectedPrompts = suggestion.selectedStudentAIPrompts || suggestion.studentAIPrompts || [];
      
      return `PHASE: ${suggestion.phase} - ${suggestion.title}
Description: ${suggestion.description}

Activities:
${suggestion.activities.map(activity => `• ${activity}`).join('\n')}

Examples:
${suggestion.examples.map(example => `• ${example}`).join('\n')}

Selected AI Prompts for Students:
${selectedPrompts.map((prompt, idx) => `${idx + 1}. "${prompt}"`).join('\n')}

Critical Thinking Questions:
${suggestion.criticalThinkingQuestions.map(question => `• ${question}`).join('\n')}

Teaching Tips:
${suggestion.teachingTips.map(tip => `• ${tip}`).join('\n')}

Responsible Use Guideline: ${suggestion.responsibleUseGuideline}`;
    }).join('\n\n' + '='.repeat(80) + '\n\n');

    const userPrompt = `Create a comprehensive, DIVER framework-structured assignment based on the following information:

ORIGINAL ASSIGNMENT DETAILS:
Title: ${assignmentTitle}
Content: ${originalAssignment}
Subject: ${subject || 'Not specified'}
Grade Level: ${gradeLevel || 'Not specified'}
Estimated Time: ${estimatedTime || 'Not specified'}

SELECTED DIVER FRAMEWORK COMPONENTS:
${selectedSuggestionsText}

ASSIGNMENT STRUCTURE REQUIREMENTS:
1. Begin with a brief introduction explaining the DIVER framework to students
2. Organize the assignment into clear phases based on the selected DIVER components above
3. For each phase, include:
   - Phase header with clear objective
   - Specific activities for students to complete
   - Selected AI prompts with clear usage instructions
   - Critical thinking questions for student reflection
   - Responsible AI use guidelines for that phase
   - Assessment criteria and expectations
   - Estimated time allocation

4. Ensure smooth transitions between phases
5. Include a final reflection section that ties all phases together
6. Maintain the core learning objectives of the original assignment
7. Format the assignment for clear student comprehension and step-by-step execution

Create a complete assignment document that students can follow from start to finish, integrating AI literacy education throughout the learning process.`;

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
