
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
    
    console.log(`=== CANVAS GRADING DEBUG ===`);
    console.log(`Received parameters:`, {
      courseId,
      quizId, 
      submissionId,
      questionId,
      score,
      comment: comment ? `"${comment.substring(0, 50)}..."` : 'null',
      user: user.email
    });
    
    if (!courseId || !quizId || !submissionId) {
      console.error(`Missing required parameters:`, { courseId, quizId, submissionId });
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, and Submission ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      // For Classic Quizzes, we need to handle this more carefully
      if (!questionId) {
        return new Response(
          JSON.stringify({ error: 'Question ID is required for Classic Quiz grading' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // First, fetch the quiz submission to get the correct attempt number and verify it exists
      const getSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}`;
      console.log(`Fetching Classic Quiz submission details: ${getSubmissionUrl}`);
      
      const submissionResponse = await fetch(getSubmissionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!submissionResponse.ok) {
        const submissionError = await submissionResponse.text();
        console.error(`Failed to fetch submission: ${submissionResponse.status} - ${submissionError}`);
        return new Response(
          JSON.stringify({ 
            error: `Quiz submission not found: ${submissionResponse.status}`,
            debug: { courseId, quizId, submissionId, url: getSubmissionUrl }
          }),
          { status: submissionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const submissionData = await submissionResponse.json();
      console.log(`Found submission with attempt: ${submissionData.quiz_submissions?.[0]?.attempt || 'unknown'}`);
      
      const actualAttempt = submissionData.quiz_submissions?.[0]?.attempt || 1;

      // Now try multiple approaches for Classic Quiz grading
      let gradeSuccess = false;
      let lastError = '';

      // Approach 1: Try the individual question scoring endpoint
      if (score !== undefined && score !== null && score !== '') {
        const questionGradeUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/questions/${questionId}/score_and_comment`;
        console.log(`Attempting individual question grading: ${questionGradeUrl}`);
        
        const questionGradeData = {
          quiz_submissions: [{
            attempt: actualAttempt,
            questions: {
              [questionId.toString()]: {
                score: parseFloat(score),
                comment: comment || ''
              }
            }
          }]
        };

        console.log(`Question grading payload:`, JSON.stringify(questionGradeData, null, 2));
        
        const questionGradeResponse = await fetch(questionGradeUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(questionGradeData),
        });

        if (questionGradeResponse.ok) {
          gradeResponse = questionGradeResponse;
          gradeSuccess = true;
          console.log('Successfully used individual question grading endpoint');
        } else {
          const errorText = await questionGradeResponse.text();
          lastError = `Question endpoint failed: ${questionGradeResponse.status} - ${errorText}`;
          console.log(lastError);
        }
      }

      // Approach 2: Try the submission update endpoint if approach 1 failed
      if (!gradeSuccess) {
        const quizSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}`;
        console.log(`Attempting submission update: ${quizSubmissionUrl}`);

        const quizSubmissionData: any = {
          quiz_submissions: [{
            attempt: actualAttempt,
            questions: {}
          }]
        };

        // Add question scoring and/or comment
        const questionData: any = {};
        if (score !== undefined && score !== null && score !== '') {
          const parsedScore = parseFloat(score);
          if (!isNaN(parsedScore)) {
            questionData.score = parsedScore;
          }
        }
        if (comment && comment.trim() !== '') {
          questionData.comment = comment;
        }

        // Only proceed if we have either score or comment to update
        if (Object.keys(questionData).length === 0) {
          return new Response(
            JSON.stringify({ error: 'Either score or comment is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        quizSubmissionData.quiz_submissions[0].questions[questionId.toString()] = questionData;

        console.log(`Classic Quiz submission payload:`, JSON.stringify(quizSubmissionData, null, 2));
        gradeResponse = await fetch(quizSubmissionUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(quizSubmissionData),
        });

        if (gradeResponse.ok) {
          gradeSuccess = true;
          console.log('Successfully used submission update endpoint');
        } else {
          const errorText = await gradeResponse.text();
          lastError += ` | Submission endpoint failed: ${gradeResponse.status} - ${errorText}`;
          console.log(`Submission update failed: ${gradeResponse.status} - ${errorText}`);
        }
      }

      // If both approaches failed, return the combined error
      if (!gradeSuccess) {
        console.error(`All Classic Quiz grading approaches failed: ${lastError}`);
        return new Response(
          JSON.stringify({ 
            error: 'All grading approaches failed for Classic Quiz',
            debug: { 
              courseId, 
              quizId, 
              submissionId, 
              questionId, 
              attempt: actualAttempt,
              errors: lastError 
            }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Only check gradeResponse if we have one and it's from New Quizzes or if Classic Quiz failed
    if (gradeResponse && !gradeResponse.ok) {
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
