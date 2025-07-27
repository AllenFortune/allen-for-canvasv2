import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: string;
}

interface PolicyOptions {
  academicIntegrity: boolean;
  permittedUses: boolean;
  citationRequirements: boolean;
  includeAssignmentSpecific: boolean;
  assignmentSpecificDetails: string;
  tone: string;
  enforcement: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syllabusData, policyOptions }: { syllabusData: SyllabusData; policyOptions: PolicyOptions } = await req.json();

    console.log('Received policy options:', JSON.stringify(policyOptions, null, 2));

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate Enhanced Syllabus
    const enhancedSyllabusPrompt = `You are an expert educator helping to enhance a course syllabus with comprehensive AI literacy policies. 

Course Information:
- Course Name: ${syllabusData.courseName}
- Subject: ${syllabusData.subject}
- Grade Level: ${syllabusData.gradeLevel}

Original Syllabus Content:
${syllabusData.content}

Policy Configuration:
- Academic Integrity Guidelines: ${policyOptions.academicIntegrity ? 'Include' : 'Basic mention'}
- Permitted AI Uses: ${policyOptions.permittedUses ? 'Detailed list' : 'General guidelines'}
- Citation Requirements: ${policyOptions.citationRequirements ? 'Specific format required' : 'Standard requirements'}
- Assignment-Specific Documentation: ${policyOptions.includeAssignmentSpecific ? 'Include specific requirements' : 'General guidance only'}
- Tone: ${policyOptions.tone}
- Enforcement Level: ${policyOptions.enforcement}

${policyOptions.includeAssignmentSpecific && policyOptions.assignmentSpecificDetails ? 
`Additional Assignment-Specific Requirements:
${policyOptions.assignmentSpecificDetails}` : ''}

CRITICAL INSTRUCTIONS:
- You MUST include ALL of the original syllabus content in your response
- Do NOT use placeholders like "[Original content retained]" or "[Keep existing content]"
- Copy the ENTIRE original syllabus text and enhance it by adding AI policy sections
- Weave AI policies naturally into the existing structure - add new sections where appropriate
- If the original syllabus has specific sections, enhance them with AI-related content
- The final output should be a complete, standalone syllabus that a teacher can use immediately

Please enhance this syllabus by seamlessly integrating AI use policies throughout the document. The enhanced syllabus should:
1. Include ALL original content word-for-word, with AI enhancements woven throughout
2. Add appropriate AI policy sections that complement the existing structure
3. Include clear expectations for AI tool usage in coursework
4. Address academic integrity concerns related to AI within existing or new sections
5. Use a ${policyOptions.tone} tone throughout all additions
6. Reflect a ${policyOptions.enforcement} approach to enforcement

Return the complete enhanced syllabus with all original content included, properly formatted and ready for classroom use.`;

    const enhancedSyllabusResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: enhancedSyllabusPrompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    // Generate AI Policy Document
    const policyDocumentPrompt = `Create a comprehensive standalone AI policy document for ${syllabusData.courseName} (${syllabusData.subject}, ${syllabusData.gradeLevel}).

Policy Requirements:
- Academic Integrity: ${policyOptions.academicIntegrity ? 'Detailed guidelines with examples' : 'Basic principles'}
- Permitted Uses: ${policyOptions.permittedUses ? 'Specific use cases and restrictions' : 'General guidance'}
- Citation: ${policyOptions.citationRequirements ? 'Mandatory citation format and examples' : 'Standard citation expectations'}
- Tone: ${policyOptions.tone}
- Enforcement: ${policyOptions.enforcement}

Create a policy document that includes:
1. Introduction to AI in education
2. Acceptable use guidelines
3. Prohibited practices
4. Citation and attribution requirements
5. Consequences for misuse
6. Examples of appropriate and inappropriate AI use
7. Resources for students

Make it comprehensive but accessible, using a ${policyOptions.tone} tone and ${policyOptions.enforcement} enforcement approach.`;

    const policyDocumentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: policyDocumentPrompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    // Generate Student Guide
    const studentGuidePrompt = `Create a practical student guide for responsible AI use in ${syllabusData.courseName} (${syllabusData.subject}, ${syllabusData.gradeLevel}).

The guide should be student-friendly and include:
1. What AI tools are and how they work
2. Step-by-step instructions for appropriate AI use in coursework
3. Examples of good AI collaboration vs. problematic dependence
4. How to properly cite AI assistance
5. Tips for maintaining academic integrity
6. Common mistakes to avoid
7. Resources for learning more about AI literacy

Tone: ${policyOptions.tone}
Focus on practical, actionable advice that helps students succeed while using AI responsibly.`;

    const studentGuideResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: studentGuidePrompt }],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    // Generate Canvas Resources
    const canvasResourcesPrompt = `Create Canvas LMS-ready content modules for AI literacy in ${syllabusData.courseName}.

Create the following modules:
1. Course AI Policy Announcement (for Canvas announcements)
2. AI Tools Tutorial Module (step-by-step Canvas module content)
3. Academic Integrity Reminder (for assignment instructions)
4. AI Citation Template (for student reference)
5. Discussion Forum Prompts (3-4 prompts for AI literacy discussions)

Format each section clearly with headers. Make content ready to copy-paste into Canvas.
Tone: ${policyOptions.tone}`;

    const canvasResourcesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: canvasResourcesPrompt }],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    // Wait for all responses
    const [enhancedData, policyData, guideData, canvasData] = await Promise.all([
      enhancedSyllabusResponse.json(),
      policyDocumentResponse.json(),
      studentGuideResponse.json(),
      canvasResourcesResponse.json(),
    ]);

    // Extract content from responses with validation
    const enhancedSyllabusContent = enhancedData.choices[0]?.message?.content || '';
    const policyDocumentContent = policyData.choices[0]?.message?.content || '';
    const studentGuideContent = guideData.choices[0]?.message?.content || '';
    const canvasResourcesContent = canvasData.choices[0]?.message?.content || '';

    // Validate that enhanced syllabus contains substantial original content
    const originalWordCount = syllabusData.content.split(/\s+/).length;
    const enhancedWordCount = enhancedSyllabusContent.split(/\s+/).length;
    const hasPlaceholders = enhancedSyllabusContent.includes('[Original content retained]') || 
                           enhancedSyllabusContent.includes('[Keep existing content]') ||
                           enhancedSyllabusContent.includes('...keep existing');

    let finalEnhancedContent = enhancedSyllabusContent;

    if (hasPlaceholders || enhancedWordCount < originalWordCount * 0.8) {
      console.warn('Enhanced syllabus appears to have placeholders or missing content, retrying...');
      
      // Retry with more explicit instructions
      const retryPrompt = `IMPORTANT: You must include the COMPLETE original syllabus content below, with AI policies integrated throughout. Do NOT use any placeholders.

Original Syllabus (INCLUDE ALL OF THIS):
${syllabusData.content}

Add AI policy sections with a ${policyOptions.tone} tone and ${policyOptions.enforcement} enforcement approach. Include ALL original text while enhancing it with AI guidelines.`;
      
      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [{ role: 'user', content: retryPrompt }],
          temperature: 0.5,
          max_tokens: 4000,
        }),
      });
      
      const retryData = await retryResponse.json();
      finalEnhancedContent = retryData.choices[0]?.message?.content || enhancedSyllabusContent;
    }

    const generatedContent = {
      enhancedSyllabus: finalEnhancedContent,
      aiPolicyDocument: policyDocumentContent,
      studentGuide: studentGuideContent,
      canvasResources: canvasResourcesContent,
    };

    console.log('Successfully generated AI syllabus content');

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating AI syllabus content:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});