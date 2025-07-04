
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
    const { courseId, quizId, submissionId, questionId, score, comment } = body;
    
    if (!courseId || !quizId || !submissionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, and Submission ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Grading quiz for course ${courseId}, quiz ${quizId}, submission ${submissionId}, user: ${user.email}`);

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

    // First, detect quiz type by fetching quiz details
    const quizUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}`;
    console.log(`Fetching quiz details: ${quizUrl}`);

    const quizResponse = await fetch(quizUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!quizResponse.ok) {
      const errorText = await quizResponse.text();
      console.error(`Failed to fetch quiz details: ${quizResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch quiz details: ${quizResponse.status}` }),
        { status: quizResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData = await quizResponse.json();
    const isNewQuizzes = !!quizData.assignment_id;
    const assignmentId = quizData.assignment_id;

    console.log(`Quiz type: ${isNewQuizzes ? 'New Quizzes' : 'Classic Quiz'}`);
    if (isNewQuizzes) {
      console.log(`Assignment ID: ${assignmentId}`);
    }

    let gradeResponse;
    let commentResponse;

    if (isNewQuizzes) {
      // For New Quizzes, grade the entire assignment submission
      const assignmentUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`;
      console.log(`Grading New Quizzes assignment: ${assignmentUrl}`);

      const gradeData: any = {};
      if (score !== undefined && score !== null && score !== '') {
        const parsedScore = parseFloat(score);
        if (!isNaN(parsedScore)) {
          gradeData.submission = {
            posted_grade: parsedScore
          };
        }
      }
      if (comment && comment.trim() !== '') {
        gradeData.comment = {
          text_comment: comment
        };
      }

      console.log(`New Quizzes payload:`, JSON.stringify(gradeData));
      gradeResponse = await fetch(assignmentUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });
    } else {
      // For Classic Quizzes, grade individual questions
      if (!questionId) {
        return new Response(
          JSON.stringify({ error: 'Question ID is required for Classic Quiz grading' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const classicQuizUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/questions/${questionId}`;
      console.log(`Grading Classic Quiz question: ${classicQuizUrl}`);

      // Only send score for the question - comments handled separately
      const gradeData: any = {};
      if (score !== undefined && score !== null && score !== '') {
        const parsedScore = parseFloat(score);
        if (!isNaN(parsedScore)) {
          gradeData.question_score = parsedScore;
        }
      }

      console.log(`Classic Quiz question payload:`, JSON.stringify(gradeData));
      gradeResponse = await fetch(classicQuizUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      // Handle comment as a separate API call for Classic Quizzes
      if (comment && comment.trim() !== '') {
        const commentUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/comments`;
        console.log(`Posting comment for Classic Quiz submission: ${commentUrl}`);
        
        const commentData = {
          quiz_submission: {
            submission_data: {
              comment: comment
            }
          }
        };
        
        console.log(`Classic Quiz comment payload:`, JSON.stringify(commentData));
        commentResponse = await fetch(commentUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(commentData),
        });

        if (!commentResponse.ok) {
          const commentErrorText = await commentResponse.text();
          console.error(`Failed to post Classic Quiz comment: ${commentResponse.status} - ${commentErrorText}`);
          // Don't fail the whole grading operation for comment failure
        } else {
          console.log('Successfully posted Classic Quiz comment');
        }
      }
    }

    if (!gradeResponse.ok) {
      const errorText = await gradeResponse.text();
      console.error(`Canvas API error: ${gradeResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${gradeResponse.status}: ${gradeResponse.statusText}`;
      if (gradeResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (gradeResponse.status === 404) {
        errorMessage = `Quiz submission not found or access denied. Quiz type: ${isNewQuizzes ? 'New Quizzes' : 'Classic Quiz'}`;
      } else if (gradeResponse.status === 400) {
        errorMessage = 'Invalid grading data provided.';
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          quizType: isNewQuizzes ? 'new_quizzes' : 'classic',
          assignmentId: assignmentId 
        }),
        { status: gradeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await gradeResponse.json();
    
    console.log(`Successfully graded ${isNewQuizzes ? 'New Quizzes assignment' : 'Classic Quiz question'}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Quiz ${isNewQuizzes ? 'assignment' : 'question'} graded successfully`,
        quizType: isNewQuizzes ? 'new_quizzes' : 'classic',
        result: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grade-canvas-quiz-question function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to grade quiz question' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
