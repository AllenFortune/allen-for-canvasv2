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
    
    // STEP 1: Get quiz questions to create ID mapping
    const questionsUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions?per_page=100`;
    console.log(`Fetching quiz questions for ID mapping: ${questionsUrl}`);
    
    const questionsResponse = await fetch(questionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    let questionIdMap = new Map();
    let questionPositionMap = new Map();
    
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      console.log(`Found ${questionsData.length} quiz questions`);
      
      // Create mappings between different ID systems
      questionsData.forEach((question, index) => {
        // Map by actual question ID
        questionIdMap.set(question.id.toString(), question);
        questionIdMap.set((index + 1).toString(), question); // Position-based mapping
        
        // Map by position for essay questions
        if (question.question_type === 'essay_question') {
          questionPositionMap.set(index + 1, question.id);
          console.log(`Essay question mapping: position ${index + 1} = question ID ${question.id} (${question.question_name})`);
        }
      });
    } else {
      console.error(`Failed to fetch quiz questions: ${questionsResponse.status}`);
    }

    // STEP 2: Get quiz details to determine if it's assignment-based
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

    let rawAnswers = [];
    let answersSource = 'unknown';

    // STEP 3: Strategy 1 - Assignment-based quiz (New Quizzes)
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
        console.log(`Assignment submission response structure:`, Object.keys(assignmentData));
        
        answersSource = 'assignment_submission';
        
        // Extract essay content from assignment submission
        if (assignmentData.body) {
          console.log(`Found assignment submission body with ${assignmentData.body.length} characters`);
          
          rawAnswers.push({
            submission_question_id: 1,
            original_question_id: 1,
            position_in_quiz: 1,
            answer: assignmentData.body,
            question_name: 'Essay Response',
            question_text: 'Essay Question Response',
            points: assignmentData.score,
            correct: null,
            source: 'assignment_body'
          });
        }
        
        // Also check submission history for additional attempts
        if (assignmentData.submission_history && assignmentData.submission_history.length > 0) {
          console.log(`Processing ${assignmentData.submission_history.length} submission history entries`);
          
          const latestSubmission = assignmentData.submission_history[0];
          if (latestSubmission.body && !rawAnswers.length) {
            rawAnswers.push({
              submission_question_id: 1,
              original_question_id: 1,
              position_in_quiz: 1,
              answer: latestSubmission.body,
              question_name: 'Essay Response',
              question_text: 'Essay Question Response',
              points: latestSubmission.score,
              correct: null,
              source: 'assignment_history'
            });
          }
        }
      } else {
        console.log(`Assignment submission fetch failed: ${assignmentResponse.status}`);
      }
    }

    // STEP 4: Strategy 2 - Classic quiz submission approach
    if (rawAnswers.length === 0) {
      console.log(`Using classic quiz submission approach`);
      answersSource = 'quiz_submission';
      
      // Get the full quiz submission with all possible includes
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

      // Extract from submission_data
      if (submissionData.quiz_submission?.submission_data) {
        console.log(`Processing submission_data (${submissionData.quiz_submission.submission_data.length} items)`);
        
        submissionData.quiz_submission.submission_data.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            question_id: item.question_id,
            answer: item.answer ? `"${item.answer.substring(0, 50)}..."` : 'null',
            text: item.text ? `"${item.text.substring(0, 50)}..."` : 'null',
            answer_text: item.answer_text ? `"${item.answer_text.substring(0, 50)}..."` : 'null'
          });

          // Try multiple fields where the answer might be stored
          let answer = null;
          if (item.answer !== undefined && item.answer !== null && item.answer !== '') {
            answer = item.answer;
          } else if (item.text !== undefined && item.text !== null && item.text !== '') {
            answer = item.text;
          } else if (item.answer_text !== undefined && item.answer_text !== null && item.answer_text !== '') {
            answer = item.answer_text;
          } else if (item.response !== undefined && item.response !== null && item.response !== '') {
            answer = item.response;
          }

          if (answer) {
            rawAnswers.push({
              submission_question_id: item.question_id,
              original_question_id: item.question_id,
              position_in_quiz: index + 1,
              answer: answer,
              question_name: item.question_name,
              question_text: item.question_text,
              points: item.points,
              correct: item.correct,
              source: 'submission_data'
            });
          }
        });
      }

      // Try the dedicated quiz submission questions endpoint if no answers found
      if (rawAnswers.length === 0) {
        const questionsApiUrl = `${canvas_instance_url}/api/v1/quiz_submissions/${submissionId}/questions`;
        console.log(`Trying dedicated questions endpoint: ${questionsApiUrl}`);

        try {
          const questionsApiResponse = await fetch(questionsApiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${canvas_access_token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          if (questionsApiResponse.ok) {
            const questionsApiData = await questionsApiResponse.json();
            const rawQuestions = questionsApiData.quiz_submission_questions || [];
            console.log(`Questions API returned ${rawQuestions.length} questions`);
            
            rawQuestions.forEach((questionData, index) => {
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
              
              if (answer) {
                rawAnswers.push({
                  submission_question_id: questionData.id,
                  original_question_id: questionData.question_id || questionData.id,
                  position_in_quiz: index + 1,
                  answer: answer,
                  question_name: questionData.question_name,
                  question_text: questionData.question_text,
                  points: questionData.points,
                  correct: questionData.correct,
                  source: 'questions_api'
                });
              }
            });
          }
        } catch (error) {
          console.log(`Questions API failed: ${error.message}`);
        }
      }
    }

    // STEP 5: Create properly mapped answers
    const mappedAnswers = [];
    
    rawAnswers.forEach(rawAnswer => {
      // Try to find the matching quiz question using various mapping strategies
      let matchedQuestion = null;
      let mappingStrategy = 'none';
      
      // Strategy 1: Direct ID match
      matchedQuestion = questionIdMap.get(rawAnswer.original_question_id.toString());
      if (matchedQuestion) {
        mappingStrategy = 'direct_id';
      }
      
      // Strategy 2: Position-based match for essay questions
      if (!matchedQuestion) {
        const questionIdByPosition = questionPositionMap.get(rawAnswer.position_in_quiz);
        if (questionIdByPosition) {
          matchedQuestion = questionIdMap.get(questionIdByPosition.toString());
          mappingStrategy = 'position_based';
        }
      }
      
      // Strategy 3: Try submission question ID
      if (!matchedQuestion) {
        matchedQuestion = questionIdMap.get(rawAnswer.submission_question_id.toString());
        if (matchedQuestion) {
          mappingStrategy = 'submission_id';
        }
      }

      if (matchedQuestion) {
        console.log(`Successfully mapped answer to question ${matchedQuestion.id} (${matchedQuestion.question_name}) using ${mappingStrategy}`);
        
        mappedAnswers.push({
          id: matchedQuestion.id,
          question_id: matchedQuestion.id,
          answer: rawAnswer.answer,
          question_name: matchedQuestion.question_name,
          question_text: matchedQuestion.question_text,
          question_type: matchedQuestion.question_type,
          points: rawAnswer.points,
          correct: rawAnswer.correct,
          source: rawAnswer.source,
          mapping_strategy: mappingStrategy
        });
      } else {
        console.log(`Could not map answer for submission question ${rawAnswer.submission_question_id}`);
        
        // Include unmapped answers with their original IDs
        mappedAnswers.push({
          id: rawAnswer.submission_question_id,
          question_id: rawAnswer.submission_question_id,
          answer: rawAnswer.answer,
          question_name: rawAnswer.question_name,
          question_text: rawAnswer.question_text,
          points: rawAnswer.points,
          correct: rawAnswer.correct,
          source: rawAnswer.source,
          mapping_strategy: 'unmapped'
        });
      }
    });

    // STEP 6: Remove duplicates, keeping the best answer for each question
    const answerMap = new Map();
    
    mappedAnswers.forEach(answer => {
      const key = answer.question_id.toString();
      const hasContent = answer.answer && 
                        answer.answer !== null && 
                        answer.answer !== undefined && 
                        answer.answer !== '' && 
                        answer.answer.toString().trim() !== '';
      
      if (!answerMap.has(key) || (hasContent && !answerMap.get(key).hasContent)) {
        answerMap.set(key, { ...answer, hasContent });
      }
    });

    const finalAnswers = Array.from(answerMap.values()).map(({ hasContent, ...answer }) => answer);
    
    console.log(`Final results: ${finalAnswers.length} unique answers found`);
    finalAnswers.forEach(answer => {
      console.log(`Question ${answer.question_id}: ${answer.answer ? 'HAS ANSWER' : 'NO ANSWER'} (${answer.mapping_strategy}, source: ${answer.source})`);
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        user_id: userId,
        answers: finalAnswers,
        debug_info: {
          total_raw_answers: rawAnswers.length,
          total_final_answers: finalAnswers.length,
          answers_with_content: finalAnswers.filter(a => a.answer && a.answer.toString().trim() !== '').length,
          answers_source: answersSource,
          is_assignment_based_quiz: isAssignmentBasedQuiz,
          assignment_id: quizData.assignment_id,
          question_mapping_created: questionIdMap.size > 0,
          essay_questions_mapped: Array.from(questionPositionMap.entries()),
          raw_answers_summary: rawAnswers.map(a => ({
            submission_q_id: a.submission_question_id,
            original_q_id: a.original_question_id,
            position: a.position_in_quiz,
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
