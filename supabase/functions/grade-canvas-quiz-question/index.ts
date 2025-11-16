import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase, user } = await authenticateUser(req);

    const body = await req.json();
    const { courseId, quizId, submissionId, questionId, score, comment, userId } = body;
    
    console.log(`=== CANVAS GRADING DEBUG ===`);
    console.log(`Received parameters:`, {
      courseId, quizId, submissionId, questionId, userId, score,
      comment: comment ? `"${comment.substring(0, 50)}..."` : 'null',
      user: user.email
    });
    
    if (!courseId || !quizId || !submissionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, and Submission ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;

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
    
    // Enhanced logging for quiz data analysis
    console.log(`Full Quiz Data:`, JSON.stringify(quizData, null, 2));
    console.log(`Assignment ID type: ${typeof quizData.assignment_id}, value: ${quizData.assignment_id}`);
    
    // Robust quiz type detection - New Quizzes have a valid numeric assignment_id
    const isNewQuizzes = typeof quizData.assignment_id === 'number' && quizData.assignment_id > 0;
    const assignmentId = quizData.assignment_id;

    console.log(`Quiz type: ${isNewQuizzes ? 'New Quizzes' : 'Classic Quiz'}`);
    console.log(`Assignment ID: ${assignmentId} (valid: ${isNewQuizzes})`);
    
    // Validation for New Quizzes
    if (isNewQuizzes && (!assignmentId || assignmentId <= 0)) {
      console.error(`Invalid assignment ID for New Quiz: ${assignmentId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid New Quiz configuration - assignment ID is missing or invalid',
          quizType: 'new_quizzes_invalid',
          assignmentId: assignmentId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let gradeResponse;

    if (isNewQuizzes) {
      // For New Quizzes, we need the userId, not submissionId
      if (!userId) {
        console.error(`Missing userId for New Quiz grading`);
        return new Response(
          JSON.stringify({ 
            error: 'User ID is required for New Quiz grading',
            quizType: 'new_quizzes',
            submissionId: submissionId 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // For New Quizzes, grade the entire assignment submission using userId
      const assignmentUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`;
      console.log(`Grading New Quizzes assignment: ${assignmentUrl} (using userId: ${userId})`);

      let finalPostedGrade = 0; // Initialize final grade

      // 1. Fetch the current submission to get the existing grade
      try {
        console.log(`Fetching current submission grade from: ${assignmentUrl}`);
        const currentSubmissionResponse = await fetch(assignmentUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (currentSubmissionResponse.ok) {
          const currentSubmissionData = await currentSubmissionResponse.json();
          const existingScore = parseFloat(currentSubmissionData.score || '0');
          if (!isNaN(existingScore)) {
            finalPostedGrade = existingScore;
            console.log(`Existing score for submission: ${existingScore}`);
          } else {
            console.log(`No existing score found, starting from 0`);
          }
        } else {
          const errorText = await currentSubmissionResponse.text();
          console.warn(`Failed to fetch current submission grade (status: ${currentSubmissionResponse.status}): ${errorText}`);
          // If fetching current grade fails, proceed with only the manual score
        }
      } catch (e) {
        console.error("Error fetching current submission grade:", e);
        // If an error occurs, proceed with only the manual score
      }

      const gradeData: any = {};
      // 2. Add the new manually graded score to the existing score
      if (score !== undefined && score !== null && score !== '') {
        const parsedManualScore = parseFloat(score);
        if (!isNaN(parsedManualScore)) {
          finalPostedGrade += parsedManualScore;
          console.log(`Adding manual score: ${parsedManualScore}, new total: ${finalPostedGrade}`);
        }
      }
      
      // Send the calculated total grade
      if (finalPostedGrade > 0) {
        gradeData.submission = {
          posted_grade: finalPostedGrade
        };
      }
      
      if (comment && comment.trim() !== '') {
        gradeData.comment = {
          text_comment: comment
        };
      }

      console.log(`New Quizzes payload with aggregated grade:`, JSON.stringify(gradeData));
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

      // Grade Classic Quiz submission
      const quizSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}`;
      console.log(`Updating Classic Quiz submission: ${quizSubmissionUrl}`);

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

      const quizSubmissionData = {
        quiz_submissions: [{
          attempt: actualAttempt,
          questions: {
            [questionId.toString()]: questionData
          }
        }]
      };

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
    }

    // Check if grading was successful
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

    // Handle response parsing safely, accounting for 204 No Content
    let result = null;
    if (gradeResponse.status !== 204) {
      try {
        result = await gradeResponse.json();
      } catch (e) {
        console.warn("Could not parse JSON from Canvas response, but request was successful. Continuing.");
      }
    }
    
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
