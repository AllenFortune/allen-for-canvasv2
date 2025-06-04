
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

import { fetchQuizQuestions, fetchQuizDetails } from './canvas-api.ts';
import { extractFromSubmissionData, extractFromQuestionsAPI } from './submission-extractor.ts';
import { extractEssayAnswers } from './essay-extractor.ts';
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

    // Step 1: Get quiz questions to create comprehensive ID mapping
    const questionMaps = await fetchQuizQuestions(credentials, courseId, quizId);

    // Step 2: Get quiz details to determine type
    const quizData = await fetchQuizDetails(credentials, courseId, quizId);
    const isAssignmentBasedQuiz = !!quizData.assignment_id;
    console.log(`Quiz type: ${isAssignmentBasedQuiz ? 'assignment-based (New Quizzes)' : 'classic Canvas quiz'}`);

    // Step 3: Try to get quiz submission data first (works for both types)
    const { rawAnswers, submissionData, answersSource } = await extractFromSubmissionData(
      credentials, courseId, quizId, submissionId, questionMaps
    );

    // Step 4: Try the dedicated quiz submission questions endpoint if no answers
    if (rawAnswers.length === 0) {
      const questionsApiAnswers = await extractFromQuestionsAPI(credentials, submissionId, questionMaps);
      rawAnswers.push(...questionsApiAnswers);
    }

    // Step 5: For assignment-based quizzes, also try assignment submission as fallback
    if (isAssignmentBasedQuiz && quizData.assignment_id && userId && rawAnswers.length === 0) {
      console.log(`Trying assignment submission as fallback for New Quizzes`);
      
      const assignmentSubmissionUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${quizData.assignment_id}/submissions/${userId}?include[]=submission_history&include[]=submission_comments`;
      
      const assignmentResponse = await fetch(assignmentSubmissionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        
        if (assignmentData.body) {
          console.log(`Found assignment submission body, mapping to first question`);
          
          rawAnswers.push({
            submission_question_id: 1,
            original_question_id: 1,
            position_in_quiz: 1,
            answer: assignmentData.body,
            question_name: 'Assignment Response',
            question_text: 'Assignment Question Response',
            question_type: 'essay_question',
            points: assignmentData.score,
            correct: null,
            source: 'assignment_body'
          });
        }
      }
    }

    // Step 6: Specific strategy for essay questions
    await extractEssayAnswers(credentials, courseId, quizId, submissionId, questionMaps, submissionData, rawAnswers);

    // Step 7: Try submission history for additional data
    if (submissionData) {
      await processSubmissionHistory(submissionData, questionMaps, rawAnswers);
    }

    // Step 8: Map raw answers to actual questions
    const mappedAnswers = mapAnswersToQuestions(rawAnswers, questionMaps);

    // Step 9: Ensure we have entries for ALL questions, even if no answers
    const finalAnswers = ensureAllQuestionsHaveEntries(mappedAnswers, questionMaps.allQuestions);

    console.log(`Final results: ${finalAnswers.length} total answers (including empty ones)`);
    finalAnswers.forEach(answer => {
      const hasAnswer = answer.answer && answer.answer.toString().trim() !== '';
      console.log(`Question ${answer.question_id} (${answer.question_type}): ${hasAnswer ? 'HAS ANSWER' : 'NO ANSWER'} (${answer.mapping_strategy}, source: ${answer.source})`);
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        user_id: userId,
        answers: finalAnswers,
        debug_info: {
          total_questions: questionMaps.allQuestions.length,
          total_raw_answers: rawAnswers.length,
          total_final_answers: finalAnswers.length,
          answers_with_content: finalAnswers.filter(a => a.answer && a.answer.toString().trim() !== '').length,
          answers_source: answersSource,
          is_assignment_based_quiz: isAssignmentBasedQuiz,
          assignment_id: quizData.assignment_id,
          question_mapping_created: questionMaps.questionIdMap.size > 0,
          raw_answers_summary: rawAnswers.map(a => ({
            submission_q_id: a.submission_question_id,
            original_q_id: a.original_question_id,
            position: a.position_in_quiz,
            question_type: a.question_type,
            has_answer: !!a.answer,
            source: a.source
          }))
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
