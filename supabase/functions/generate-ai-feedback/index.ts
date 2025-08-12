
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORS_HEADERS } from './config.ts';
import { generateSystemPrompt, generateUserPrompt, GradingRequest } from './prompt-generators.ts';
import { callOpenAI, parseAIResponse } from './openai-service.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const requestBody = await req.json();
    
    // Handle quiz question grading
    if (requestBody.isQuizQuestion) {
      const {
        questionText,
        questionType,
        questionName,
        studentAnswer,
        pointsPossible,
        currentGrade,
        isSummativeAssessment = true,
        customPrompt
      } = requestBody;

      console.log('Generating AI grading for quiz question:', questionName);
      console.log('Question type:', questionType);
      console.log('Assessment type:', isSummativeAssessment ? 'Summative' : 'Formative');

      // Import quiz prompt generator
      const { generateQuizSystemPrompt, generateQuizUserPrompt } = await import('./quiz-prompt-generator.ts');

      const systemPrompt = generateQuizSystemPrompt(
        isSummativeAssessment,
        pointsPossible,
        customPrompt
      );

      const userPrompt = generateQuizUserPrompt(
        questionText,
        questionType,
        studentAnswer,
        pointsPossible,
        currentGrade,
        questionName
      );

      const aiResponseContent = await callOpenAI(systemPrompt, userPrompt);
      const parsedResponse = parseAIResponse(aiResponseContent, isSummativeAssessment);

      console.log('AI quiz grading generated successfully');
      
      return new Response(JSON.stringify(parsedResponse), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Handle regular assignment grading
    const { 
      submissionContent, 
      assignmentName, 
      assignmentDescription, 
      pointsPossible,
      currentGrade,
      rubric,
      useRubric = false,
      isSummativeAssessment = true,
      customPrompt
    } = requestBody;

    console.log('Generating comprehensive AI grading for assignment:', assignmentName);
    console.log('Using rubric for grading:', useRubric);
    console.log('Assessment type:', isSummativeAssessment ? 'Summative' : 'Formative');
    console.log('Custom prompt provided:', !!customPrompt);

    const gradingRequest: GradingRequest = {
      submissionContent,
      assignmentName,
      assignmentDescription,
      pointsPossible,
      currentGrade,
      rubric,
      useRubric,
      isSummativeAssessment,
      customPrompt
    };

    const systemPrompt = generateSystemPrompt(
      isSummativeAssessment, 
      pointsPossible, 
      customPrompt
    );
    const userPrompt = generateUserPrompt(gradingRequest);

    const aiResponseContent = await callOpenAI(systemPrompt, userPrompt);
    const parsedResponse = parseAIResponse(aiResponseContent, isSummativeAssessment);

    const gradingMode = useRubric && rubric ? 'rubric criteria' : 'assignment description';
    const assessmentType = isSummativeAssessment ? 'summative' : 'formative';

    console.log(`AI grading generated successfully for assignment using:`, gradingMode, 'for', assessmentType);
    console.log('10% leniency buffer methodology applied');
    if (customPrompt) {
      console.log('Custom grading instructions applied');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate AI grading', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
