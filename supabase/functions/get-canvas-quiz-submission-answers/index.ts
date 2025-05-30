
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { courseId, quizId, submissionId } = body;
    
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

    const { canvas_instance_url, canvas_access_token } = profile;
    
    // Try the more comprehensive quiz submissions endpoint first
    const submissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}?include[]=submission_history&include[]=user&include[]=quiz`;
    console.log(`Fetching submission details from: ${submissionUrl}`);

    const submissionResponse = await fetch(submissionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error(`Canvas API error fetching submission: ${submissionResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${submissionResponse.status}: ${submissionResponse.statusText}`;
      if (submissionResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (submissionResponse.status === 404) {
        errorMessage = 'Quiz submission not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: submissionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const submissionData = await submissionResponse.json();
    console.log(`Successfully fetched submission data from Canvas`);

    // Now try to get the detailed question answers using the quiz_submissions endpoint
    const questionsUrl = `${canvas_instance_url}/api/v1/quiz_submissions/${submissionId}/questions`;
    console.log(`Fetching submission questions from: ${questionsUrl}`);

    const questionsResponse = await fetch(questionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    let questions = [];
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      questions = questionsData.quiz_submission_questions || [];
      console.log(`Successfully fetched ${questions.length} question answers from Canvas`);
    } else {
      console.log(`Could not fetch question details, using submission history instead`);
      
      // Fallback: try to extract answers from submission history
      if (submissionData.quiz_submission?.submission_history) {
        const latestAttempt = submissionData.quiz_submission.submission_history[0];
        if (latestAttempt?.submission_data) {
          questions = latestAttempt.submission_data.map((item: any) => ({
            id: item.question_id,
            question_id: item.question_id,
            answer: item.answer || item.text || null,
            correct: item.correct,
            points: item.points,
            question_name: item.question_name,
            question_text: item.question_text
          }));
          console.log(`Extracted ${questions.length} answers from submission history`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        answers: questions,
        submission_data: submissionData.quiz_submission
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-quiz-submission-answers function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz submission answers from Canvas' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
