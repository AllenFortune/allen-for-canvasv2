
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
    
    // Strategy 1: Try the comprehensive quiz submission endpoint with all includes
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
    console.log(`Full submission response structure:`, JSON.stringify(submissionData, null, 2));

    let questions = [];

    // Strategy 2: Extract from submission_questions if available (preferred method)
    if (submissionData.submission_questions && Array.isArray(submissionData.submission_questions)) {
      console.log(`Processing ${submissionData.submission_questions.length} submission_questions`);
      
      questions = submissionData.submission_questions.map((questionData: any) => {
        console.log(`Processing submission question ${questionData.id}:`, JSON.stringify(questionData, null, 2));
        
        let answer = null;
        
        // Extract answer based on question type and Canvas response format
        if (questionData.answer !== undefined && questionData.answer !== null && questionData.answer !== '') {
          answer = questionData.answer;
          console.log(`Found answer in 'answer' field for question ${questionData.id}:`, answer);
        } else if (questionData.student_answer !== undefined && questionData.student_answer !== null && questionData.student_answer !== '') {
          answer = questionData.student_answer;
          console.log(`Found answer in 'student_answer' field for question ${questionData.id}:`, answer);
        } else if (questionData.text !== undefined && questionData.text !== null && questionData.text !== '') {
          answer = questionData.text;
          console.log(`Found answer in 'text' field for question ${questionData.id}:`, answer);
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

    // Strategy 3: Try the dedicated quiz submission questions endpoint
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
        console.log(`Questions endpoint response:`, JSON.stringify(questionsData, null, 2));
        
        const rawQuestions = questionsData.quiz_submission_questions || [];
        console.log(`Found ${rawQuestions.length} questions from dedicated endpoint`);
        
        questions = rawQuestions.map((questionData: any) => {
          console.log(`Processing dedicated endpoint question ${questionData.id}:`, JSON.stringify(questionData, null, 2));
          
          let answer = null;
          
          // More comprehensive answer extraction for different question types
          if (questionData.answer !== undefined && questionData.answer !== null) {
            answer = questionData.answer;
          } else if (questionData.user_answer !== undefined && questionData.user_answer !== null) {
            answer = questionData.user_answer;
          } else if (questionData.submitted_answers && Array.isArray(questionData.submitted_answers)) {
            // Handle submitted_answers array format
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

    // Strategy 4: Extract from submission history as final fallback
    if (questions.length === 0 || questions.every(q => q.answer === null)) {
      console.log(`Falling back to submission history extraction`);
      
      if (submissionData.quiz_submission?.submission_history) {
        console.log(`Processing submission history:`, JSON.stringify(submissionData.quiz_submission.submission_history, null, 2));
        
        const latestAttempt = submissionData.quiz_submission.submission_history[0];
        if (latestAttempt?.submission_data) {
          console.log(`Processing submission_data from history:`, JSON.stringify(latestAttempt.submission_data, null, 2));
          
          questions = latestAttempt.submission_data.map((item: any) => {
            console.log(`Processing submission data item:`, JSON.stringify(item, null, 2));
            
            let answer = null;
            
            // Try multiple fields where answer might be stored in submission history
            if (item.answer !== undefined && item.answer !== null) {
              answer = item.answer;
            } else if (item.text !== undefined && item.text !== null) {
              answer = item.text;
            } else if (item.answer_text !== undefined && item.answer_text !== null) {
              answer = item.answer_text;
            } else if (item.response !== undefined && item.response !== null) {
              answer = item.response;
            }
            
            return {
              id: item.question_id,
              question_id: item.question_id,
              answer: answer,
              correct: item.correct,
              points: item.points,
              question_name: item.question_name,
              question_text: item.question_text
            };
          });
        }
      }
    }

    // Strategy 5: Try alternative submission endpoint if still no answers
    if (questions.length === 0 || questions.every(q => q.answer === null)) {
      console.log(`Trying alternative submission endpoint with quiz_submission_attempts`);
      
      const altSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/attempts/1`;
      console.log(`Alternative endpoint: ${altSubmissionUrl}`);
      
      try {
        const altResponse = await fetch(altSubmissionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log(`Alternative endpoint response:`, JSON.stringify(altData, null, 2));
          
          if (altData.quiz_submission_questions) {
            questions = altData.quiz_submission_questions.map((q: any) => ({
              id: q.id,
              question_id: q.question_id || q.id,
              answer: q.answer || q.user_answer || q.text || null,
              correct: q.correct,
              points: q.points,
              question_name: q.question_name,
              question_text: q.question_text
            }));
          }
        }
      } catch (error) {
        console.log(`Alternative endpoint failed:`, error.message);
      }
    }

    // Final processing and validation
    console.log(`Final questions array (${questions.length} questions):`, JSON.stringify(questions, null, 2));
    
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
        submission_data: submissionData.quiz_submission,
        debug_info: {
          total_answers_found: questions.length,
          questions_with_content: answersWithContent.length,
          strategies_used: [
            'submission_questions',
            'quiz_submission_questions_endpoint', 
            'submission_history',
            'alternative_attempts_endpoint'
          ],
          canvas_response_keys: Object.keys(submissionData)
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
