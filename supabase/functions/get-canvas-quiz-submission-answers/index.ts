
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

import { fetchQuizQuestions, fetchQuizDetails } from './canvas-api.ts';
import { extractFromSubmissionData, extractFromQuestionsAPI } from './submission-extractor.ts';
import { extractEssayAnswers } from './essay-extractor.ts';
import { extractFromNewQuizzes } from './new-quizzes-extractor.ts';
import { detectQuizType } from './quiz-type-detector.ts';
import { processSubmissionHistory, mapAnswersToQuestions, ensureAllQuestionsHaveEntries } from './answer-processor.ts';
import { CanvasCredentials } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { courseId, quizId, submissionId, userId } = body;
    
    if (!courseId || !quizId || !submissionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, and Submission ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quiz submission answers for course ${courseId}, quiz ${quizId}, submission ${submissionId}, user: ${user.email}`);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials: CanvasCredentials = {
      canvas_instance_url: profile.canvas_instance_url,
      canvas_access_token: profile.canvas_access_token
    };

    // Step 1: Detect quiz type (Classic vs New Quizzes)
    const quizTypeInfo = await detectQuizType(credentials, courseId, quizId);
    console.log(`Quiz type: ${quizTypeInfo.quizType}, Assignment ID: ${quizTypeInfo.assignmentId}`);

    // Step 2: Get quiz questions to create comprehensive ID mapping
    const questionMaps = await fetchQuizQuestions(credentials, courseId, quizId);

    // Step 3: Extract answers using appropriate method based on quiz type
    let rawAnswers: any[] = [];
    let answersSource = 'unknown';

    if (quizTypeInfo.isNewQuizzes && quizTypeInfo.assignmentId && userId) {
      // New Quizzes - use enhanced extraction method
      console.log('Using enhanced New Quizzes extraction method');
      const newQuizzesAnswers = await extractFromNewQuizzes(
        credentials, courseId, quizTypeInfo.assignmentId, submissionId, userId, questionMaps
      );
      rawAnswers.push(...newQuizzesAnswers);
      answersSource = 'new_quizzes_enhanced';
    } else {
      // Classic Quiz - use traditional methods
      console.log('Using Classic Quiz extraction methods');
      const { rawAnswers: classicAnswers, submissionData, answersSource: classicSource } = 
        await extractFromSubmissionData(credentials, courseId, quizId, submissionId, questionMaps);
      
      rawAnswers.push(...classicAnswers);
      answersSource = classicSource;

      // Fallback to questions API if no answers found
      if (rawAnswers.length === 0) {
        const questionsApiAnswers = await extractFromQuestionsAPI(credentials, submissionId, questionMaps);
        rawAnswers.push(...questionsApiAnswers);
        answersSource = 'questions_api';
      }

      // Try essay extraction for classic quizzes
      if (submissionData) {
        await extractEssayAnswers(credentials, courseId, quizId, submissionId, questionMaps, submissionData, rawAnswers);
        await processSubmissionHistory(submissionData, questionMaps, rawAnswers);
      }
    }

    // Step 4: Map raw answers to actual questions
    const mappedAnswers = mapAnswersToQuestions(rawAnswers, questionMaps);

    // Step 5: Ensure we have entries for ALL questions, even if no answers
    const finalAnswers = ensureAllQuestionsHaveEntries(mappedAnswers, questionMaps.allQuestions);

    console.log(`Final results: ${finalAnswers.length} total answers (including empty ones)`);
    const answersWithContent = finalAnswers.filter(a => a.answer && a.answer.toString().trim() !== '');
    console.log(`Found ${answersWithContent.length}/${finalAnswers.length} answers with actual content`);

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        user_id: userId,
        answers: finalAnswers,
        debug_info: {
          quiz_type: quizTypeInfo.quizType,
          is_new_quizzes: quizTypeInfo.isNewQuizzes,
          assignment_id: quizTypeInfo.assignmentId,
          total_questions: questionMaps.allQuestions.length,
          total_raw_answers: rawAnswers.length,
          total_final_answers: finalAnswers.length,
          answers_with_content: answersWithContent.length,
          answers_source: answersSource,
          question_mapping_created: questionMaps.questionIdMap.size > 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-quiz-submission-answers function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz submission answers from Canvas',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
