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

    // Helper function to clean AI response content
    const cleanAIContent = (content: string): string => {
      const introPatterns = [
        /^(Certainly!?|Sure!?|Of course!?|Absolutely!?)[^\n]*\n+/i,
        /^(Here is|Here's|Below is|Here you'll find)[^\n]*\n+/i,
        /^(I'll|I will|Let me)[^\n]*\n+/i,
        /^(This is|This enhanced)[^\n]*\n+/i,
        /^\*?[^*\n]*\*?\s*(syllabus|document|guide)[^.\n]*\.\s*\n+/i,
        /^[^.\n]*enhanced.*below[^.\n]*\.\s*\n+/i,
        /^[^.\n]*comprehensive[^.\n]*integrated[^.\n]*\.\s*\n+/i
      ];
      
      let cleaned = content;
      for (const pattern of introPatterns) {
        cleaned = cleaned.replace(pattern, '');
      }
      
      // Remove leading whitespace and ensure proper formatting
      return cleaned.trim();
    };

    // Generate Enhanced Syllabus
    const enhancedSyllabusPrompt = `You are a professional syllabus editor. Your task is to enhance the provided syllabus with AI literacy policies. 

CRITICAL OUTPUT REQUIREMENTS:
- Start immediately with the course title or first line of the syllabus
- Do NOT include any introductory text, explanations, or meta-commentary
- Do NOT begin with phrases like "Certainly", "Here is", "Below is", etc.
- Your response must be the actual syllabus content only

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

CONTENT REQUIREMENTS:
- Include ALL original syllabus content word-for-word
- Add AI policy sections seamlessly integrated into the structure
- Use ${policyOptions.tone} tone for all AI-related additions
- Apply ${policyOptions.enforcement} enforcement approach
- No placeholders - include complete, usable content

Begin with the course title or first syllabus line immediately:`;

    const enhancedSyllabusResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional syllabus editor. Respond only with syllabus content. Do not include introductory text, explanations, or conversational elements. Start immediately with the actual syllabus content.'
          },
          { 
            role: 'user', 
            content: enhancedSyllabusPrompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    // Generate AI Policy Document
    const policyDocumentPrompt = `Generate an AI policy document for ${syllabusData.courseName} (${syllabusData.subject}, ${syllabusData.gradeLevel}). Start immediately with the document title.

Policy Requirements:
- Academic Integrity: ${policyOptions.academicIntegrity ? 'Detailed guidelines with examples' : 'Basic principles'}
- Permitted Uses: ${policyOptions.permittedUses ? 'Specific use cases and restrictions' : 'General guidance'}
- Citation: ${policyOptions.citationRequirements ? 'Mandatory citation format and examples' : 'Standard citation expectations'}
- Tone: ${policyOptions.tone}
- Enforcement: ${policyOptions.enforcement}

Include these sections:
1. Introduction to AI in education
2. Acceptable use guidelines
3. Prohibited practices
4. Citation and attribution requirements
5. Consequences for misuse
6. Examples of appropriate and inappropriate AI use
7. Resources for students

Use ${policyOptions.tone} tone and ${policyOptions.enforcement} enforcement approach. Begin with the policy title:`;

    const policyDocumentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a policy document writer. Respond only with document content. Do not include introductory text or explanations. Start immediately with the document title.'
          },
          { 
            role: 'user', 
            content: policyDocumentPrompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    // Generate Student Guide
    const studentGuidePrompt = `Generate a student guide for responsible AI use in ${syllabusData.courseName} (${syllabusData.subject}, ${syllabusData.gradeLevel}). Start immediately with the guide title.

Include these sections:
1. What AI tools are and how they work
2. Step-by-step instructions for appropriate AI use in coursework
3. Examples of good AI collaboration vs. problematic dependence
4. How to properly cite AI assistance
5. Tips for maintaining academic integrity
6. Common mistakes to avoid
7. Resources for learning more about AI literacy

Use ${policyOptions.tone} tone and focus on practical, actionable advice. Begin with the guide title:`;

    const studentGuideResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a student guide writer. Respond only with guide content. Do not include introductory text or explanations. Start immediately with the guide title.'
          },
          { 
            role: 'user', 
            content: studentGuidePrompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    // Generate Canvas Resources
    const canvasResourcesPrompt = `Generate Canvas LMS-ready content modules for AI literacy in ${syllabusData.courseName}. Start immediately with the first module.

Create these modules:
1. Course AI Policy Announcement (for Canvas announcements)
2. AI Tools Tutorial Module (step-by-step Canvas module content)
3. Academic Integrity Reminder (for assignment instructions)
4. AI Citation Template (for student reference)
5. Discussion Forum Prompts (3-4 prompts for AI literacy discussions)

Format with clear headers, ready to copy-paste into Canvas. Use ${policyOptions.tone} tone. Begin with the first module:`;

    const canvasResourcesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a Canvas LMS content creator. Respond only with module content. Do not include introductory text or explanations. Start immediately with the first module.'
          },
          { 
            role: 'user', 
            content: canvasResourcesPrompt 
          }
        ],
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

    // Extract content from responses with validation and cleaning
    const enhancedSyllabusContent = cleanAIContent(enhancedData.choices[0]?.message?.content || '');
    const policyDocumentContent = cleanAIContent(policyData.choices[0]?.message?.content || '');
    const studentGuideContent = cleanAIContent(guideData.choices[0]?.message?.content || '');
    const canvasResourcesContent = cleanAIContent(canvasData.choices[0]?.message?.content || '');

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
      const retryPrompt = `CRITICAL: Start immediately with the course title. Do not include any introductory text.

Original Syllabus (INCLUDE ALL OF THIS):
${syllabusData.content}

Add AI policy sections with ${policyOptions.tone} tone and ${policyOptions.enforcement} enforcement. Include ALL original text while enhancing it with AI guidelines. Begin with the course title:`;
      
      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional syllabus editor. Respond only with syllabus content. Start immediately with the course title. No introductory text.'
          },
          { 
            role: 'user', 
            content: retryPrompt 
          }
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
      });
      
      const retryData = await retryResponse.json();
      finalEnhancedContent = cleanAIContent(retryData.choices[0]?.message?.content || enhancedSyllabusContent);
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