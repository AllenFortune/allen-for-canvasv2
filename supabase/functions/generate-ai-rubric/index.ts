
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { 
      assignmentContent, 
      rubricType = 'analytic', 
      pointsPossible = 100,
      includeDiverAlignment = false,
      subjectArea,
      gradeLevel 
    } = await req.json();

    if (!assignmentContent) {
      throw new Error('Assignment content is required');
    }

    const prompt = generateRubricPrompt(
      assignmentContent, 
      rubricType, 
      pointsPossible, 
      includeDiverAlignment,
      subjectArea,
      gradeLevel
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert educational assessment designer who creates comprehensive, pedagogically sound rubrics.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the generated rubric content
    const rubricData = parseGeneratedRubric(generatedContent, rubricType, pointsPossible);

    return new Response(JSON.stringify(rubricData), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-rubric function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateRubricPrompt(
  content: string, 
  rubricType: string, 
  pointsPossible: number,
  includeDiverAlignment: boolean,
  subjectArea?: string,
  gradeLevel?: string
): string {
  const diverComponent = includeDiverAlignment ? `
  
  IMPORTANT: Also align this rubric with the DIVER AI Literacy Framework:
  - D (Define): Clear understanding of AI concepts and limitations
  - I (Inquire): Critical questioning and evaluation of AI-generated content  
  - V (Verify): Cross-referencing and fact-checking AI outputs
  - E (Evaluate): Assessment of AI tool effectiveness and appropriateness
  - R (Reflect): Thoughtful consideration of AI's impact and ethical implications
  
  Include criteria that assess students' responsible AI use and digital literacy.` : '';

  const contextInfo = [
    subjectArea && `Subject Area: ${subjectArea}`,
    gradeLevel && `Grade Level: ${gradeLevel}`
  ].filter(Boolean).join('\n');

  return `Create a comprehensive ${rubricType} rubric for the following assignment with ${pointsPossible} total points:

${contextInfo ? `${contextInfo}\n` : ''}
ASSIGNMENT CONTENT:
${content}

RUBRIC TYPE: ${rubricType}
- Analytic: Multiple criteria with separate performance levels for each
- Holistic: Single overall performance scale
- Single-point: Focus on proficiency with areas for growth and exceeding expectations

Requirements:
1. Create clear, measurable criteria that align with the assignment objectives
2. Define 4 performance levels: Exemplary, Proficient, Developing, Inadequate
3. Distribute points appropriately across criteria (total: ${pointsPossible} points)
4. Use specific, observable language for each performance level
5. Ensure criteria are fair, unbiased, and developmentally appropriate${diverComponent}

Return the rubric in this JSON format:
{
  "title": "Assignment Title - Rubric",
  "description": "Brief description of what this rubric assesses",
  "criteria": [
    {
      "name": "Criteria Name",
      "description": "What this criteria measures",
      "points": number,
      "levels": [
        {
          "name": "Exemplary",
          "description": "Detailed description of exemplary performance",
          "points": number
        },
        {
          "name": "Proficient", 
          "description": "Detailed description of proficient performance",
          "points": number
        },
        {
          "name": "Developing",
          "description": "Detailed description of developing performance", 
          "points": number
        },
        {
          "name": "Inadequate",
          "description": "Detailed description of inadequate performance",
          "points": number
        }
      ]
    }
  ],
  "performance_levels": ["Exemplary", "Proficient", "Developing", "Inadequate"],
  "diver_alignment": ${includeDiverAlignment ? '{"components": ["D", "I", "V", "E", "R"], "integrated": true}' : '{}'}
}`;
}

function parseGeneratedRubric(content: string, rubricType: string, pointsPossible: number) {
  try {
    // Try to parse JSON directly first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const rubricData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      return {
        title: rubricData.title || 'Generated Rubric',
        description: rubricData.description || '',
        rubricType,
        pointsPossible,
        criteria: rubricData.criteria || [],
        performanceLevels: rubricData.performance_levels || ['Exemplary', 'Proficient', 'Developing', 'Inadequate'],
        diverAlignment: rubricData.diver_alignment || {}
      };
    }
    
    // Fallback: create a basic rubric structure if parsing fails
    return createFallbackRubric(content, rubricType, pointsPossible);
    
  } catch (error) {
    console.error('Error parsing rubric:', error);
    return createFallbackRubric(content, rubricType, pointsPossible);
  }
}

function createFallbackRubric(content: string, rubricType: string, pointsPossible: number) {
  return {
    title: 'Generated Rubric',
    description: 'AI-generated rubric based on assignment content',
    rubricType,
    pointsPossible,
    criteria: [
      {
        name: 'Content Quality',
        description: 'Assessment of content understanding and accuracy',
        points: Math.floor(pointsPossible * 0.4),
        levels: [
          { name: 'Exemplary', description: 'Exceptional understanding and accuracy', points: Math.floor(pointsPossible * 0.4) },
          { name: 'Proficient', description: 'Good understanding with minor gaps', points: Math.floor(pointsPossible * 0.3) },
          { name: 'Developing', description: 'Basic understanding with some gaps', points: Math.floor(pointsPossible * 0.2) },
          { name: 'Inadequate', description: 'Limited understanding with major gaps', points: Math.floor(pointsPossible * 0.1) }
        ]
      }
    ],
    performanceLevels: ['Exemplary', 'Proficient', 'Developing', 'Inadequate'],
    diverAlignment: {}
  };
}
