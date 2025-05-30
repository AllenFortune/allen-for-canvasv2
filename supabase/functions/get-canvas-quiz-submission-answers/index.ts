
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

    const { canvas_instance_url, canvas_access_token } = profile;
    
    // First, get quiz details to determine if it's assignment-based
    const quizUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}`;
    console.log(`Fetching quiz details to determine type: ${quizUrl}`);

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
      console.error(`Canvas API error fetching quiz: ${quizResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${quizResponse.status}: ${quizResponse.statusText}`;
      if (quizResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (quizResponse.status === 404) {
        errorMessage = 'Quiz not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: quizResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData = await quizResponse.json();
    const isAssignmentBasedQuiz = !!quizData.assignment_id;
    console.log(`Quiz type: ${isAssignmentBasedQuiz ? 'assignment-based (New Quizzes)' : 'classic Canvas quiz'}`);
    console.log(`Assignment ID: ${quizData.assignment_id || 'none'}`);

    let questions = [];
    let answersSource = 'unknown';

    // Strategy 1: If this is an assignment-based quiz (New Quizzes), get answers from assignment submission
    if (isAssignmentBasedQuiz && quizData.assignment_id && userId) {
      console.log(`Fetching assignment submission for assignment ID: ${quizData.assignment_id}, user ID: ${userId}`);
      
      const assignmentSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${quizData.assignment_id}/submissions/${userId}?include[]=submission_history&include[]=submission_comments&include[]=rubric_assessment`;
      
      console.log(`Assignment submission URL: ${assignmentSubmissionUrl}`);

      const assignmentResponse = await fetch(assignmentSubmissionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        console.log(`Assignment submission response:`, JSON.stringify(assignmentData, null, 2));
        
        answersSource = 'assignment_submission';
        
        // Extract essay content from assignment submission
        if (assignmentData.body) {
          console.log(`Found assignment submission body:`, assignmentData.body);
          
          // For assignment-based quizzes, the essay content is typically in the submission body
          // We'll create a single question entry with the essay content
          questions = [{
            id: 1,
            question_id: 1,
            answer: assignmentData.body,
            correct: null,
            points: assignmentData.score,
            question_name: 'Essay Response',
            question_text: 'Essay Question Response'
          }];
        }
        
        // Also check submission history for additional attempts
        if (assignmentData.submission_history && assignmentData.submission_history.length > 0) {
          console.log(`Processing ${assignmentData.submission_history.length} submission history entries`);
          
          const latestSubmission = assignmentData.submission_history[0];
          if (latestSubmission.body && !questions.length) {
            questions = [{
              id: 1,
              question_id: 1,
              answer: latestSubmission.body,
              correct: null,
              points: latestSubmission.score,
              question_name: 'Essay Response',
              question_text: 'Essay Question Response'
            }];
          }
        }
      } else {
        console.log(`Assignment submission fetch failed: ${assignmentResponse.status}`);
      }
    }

    // Strategy 2: Classic quiz submission approach (fallback or for classic quizzes)
    if (questions.length === 0) {
      console.log(`Using classic quiz submission approach`);
      answersSource = 'quiz_submission';
      
      // Try the comprehensive quiz submission endpoint with all includes
      const submissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}?include[]=submission&include[]=quiz&include[]=user&include[]=submission_questions&include[]=submission_history`;
      console.log(`Fetching comprehensive submission details from: ${submissionUrl}`);

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

      // Extract from submission_questions if available
      if (submissionData.submission_questions && Array.isArray(submissionData.submission_questions)) {
        console.log(`Processing ${submissionData.submission_questions.length} submission_questions`);
        
        questions = submissionData.submission_questions.map((questionData: any) => {
          let answer = null;
          
          if (questionData.answer !== undefined && questionData.answer !== null && questionData.answer !== '') {
            answer = questionData.answer;
          } else if (questionData.student_answer !== undefined && questionData.student_answer !== null && questionData.student_answer !== '') {
            answer = questionData.student_answer;
          } else if (questionData.text !== undefined && questionData.text !== null && questionData.text !== '') {
            answer = questionData.text;
          }
          
          return {
            id: questionData.id,
            question_id: questionData.question_id || questionData.id,
            answer: answer,
            correct: questionData.correct,
            points: questionData.points,
            question_name: questionData.question_name,
            question_text: questionData.question_text
          };
        });
      }

      // Try the dedicated quiz submission questions endpoint if no answers found
      if (questions.length === 0 || questions.every(q => q.answer === null)) {
        const questionsUrl = `${canvas_instance_url}/api/v1/quiz_submissions/${submissionId}/questions`;
        console.log(`Trying dedicated questions endpoint: ${questionsUrl}`);

        const questionsResponse = await fetch(questionsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          const rawQuestions = questionsData.quiz_submission_questions || [];
          
          questions = rawQuestions.map((questionData: any) => {
            let answer = null;
            
            if (questionData.answer !== undefined && questionData.answer !== null) {
              answer = questionData.answer;
            } else if (questionData.user_answer !== undefined && questionData.user_answer !== null) {
              answer = questionData.user_answer;
            } else if (questionData.submitted_answers && Array.isArray(questionData.submitted_answers)) {
              const submittedAnswer = questionData.submitted_answers[0];
              if (submittedAnswer) {
                answer = submittedAnswer.text || submittedAnswer.answer_text || submittedAnswer.answer || submittedAnswer;
              }
            }
            
            return {
              id: questionData.id,
              question_id: questionData.question_id || questionData.id,
              answer: answer,
              correct: questionData.correct,
              points: questionData.points,
              question_name: questionData.question_name,
              question_text: questionData.question_text
            };
          });
        }
      }
    }

    // Final processing and validation
    console.log(`Final questions array (${questions.length} questions) from ${answersSource}:`, JSON.stringify(questions, null, 2));
    
    const answersWithContent = questions.filter(q => 
      q.answer !== null && 
      q.answer !== undefined && 
      q.answer !== '' && 
      (typeof q.answer !== 'string' || q.answer.trim() !== '')
    );
    
    console.log(`Questions with actual content: ${answersWithContent.length}/${questions.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        answers: questions,
        debug_info: {
          total_answers_found: questions.length,
          questions_with_content: answersWithContent.length,
          answers_source: answersSource,
          is_assignment_based_quiz: isAssignmentBasedQuiz,
          assignment_id: quizData.assignment_id,
          user_id: userId
        }
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
