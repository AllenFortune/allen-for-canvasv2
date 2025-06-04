
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

    // Helper function to extract answer based on question type
    const extractAnswerByType = (item: any, questionType: string) => {
      console.log(`Extracting answer for question type: ${questionType}`, {
        item_keys: Object.keys(item),
        answer: item.answer,
        text: item.text,
        answer_text: item.answer_text
      });

      switch (questionType) {
        case 'essay_question':
          // For essay questions, look for text content in multiple fields
          return item.text || item.answer_text || item.answer || item.response || null;
        
        case 'matching_question':
          // For matching questions, handle the match pairs
          if (item.answer && typeof item.answer === 'object') {
            if (Array.isArray(item.answer)) {
              // Handle array format for matching
              return item.answer.map((match: any, index: number) => ({
                match_id: match.answer_id || match.id || index,
                answer_text: match.text || match.answer_text || match.answer || 'No match'
              }));
            } else {
              // Handle object format for matching
              const matches = [];
              for (const [key, value] of Object.entries(item.answer)) {
                matches.push({
                  match_id: key,
                  answer_text: typeof value === 'string' ? value : JSON.stringify(value)
                });
              }
              return matches;
            }
          }
          return item.text || item.answer_text || null;
        
        case 'multiple_answers_question':
          // For multiple answer questions, handle array selections
          if (item.answer && Array.isArray(item.answer)) {
            return item.answer;
          }
          return item.answer || item.text || item.answer_text || null;
        
        case 'fill_in_multiple_blanks_question':
          // For fill-in-the-blank questions, handle multiple blank answers
          if (item.answer && typeof item.answer === 'object' && !Array.isArray(item.answer)) {
            const blanks = [];
            for (const [blankId, blankAnswer] of Object.entries(item.answer)) {
              blanks.push({
                blank_id: blankId,
                answer_text: blankAnswer
              });
            }
            return blanks;
          }
          return item.answer || item.text || item.answer_text || null;
        
        case 'multiple_choice_question':
        case 'true_false_question':
        default:
          // For standard question types, use the standard extraction
          return item.answer !== undefined ? item.answer : 
                 item.text !== undefined ? item.text : 
                 item.answer_text !== undefined ? item.answer_text : 
                 item.response !== undefined ? item.response : null;
      }
    };
    
    // STEP 1: Get quiz questions to create comprehensive ID mapping
    const questionsUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions?per_page=100`;
    console.log(`Fetching quiz questions for comprehensive mapping: ${questionsUrl}`);
    
    const questionsResponse = await fetch(questionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    let questionIdMap = new Map();
    let positionToQuestionMap = new Map();
    let allQuestions = [];
    
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      allQuestions = questionsData;
      console.log(`Found ${questionsData.length} quiz questions`);
      
      // Create comprehensive mappings for ALL questions
      questionsData.forEach((question, index) => {
        const position = index + 1;
        
        // Map by actual question ID
        questionIdMap.set(question.id.toString(), question);
        
        // Map by position (very important for Canvas submission data)
        questionIdMap.set(position.toString(), question);
        positionToQuestionMap.set(position, question);
        
        console.log(`Question mapping: Position ${position} = Question ID ${question.id} (${question.question_type}) - "${question.question_name || question.question_text?.substring(0, 50)}..."`);
      });
    } else {
      console.error(`Failed to fetch quiz questions: ${questionsResponse.status}`);
    }

    // STEP 2: Get quiz details to determine type
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

    let rawAnswers = [];
    let answersSource = 'unknown';

    // STEP 3: Try to get quiz submission data first (works for both types)
    console.log(`Fetching quiz submission data for all questions`);
    
    const submissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}?include[]=submission&include[]=quiz&include[]=user&include[]=submission_questions&include[]=submission_history`;
    console.log(`Quiz submission URL: ${submissionUrl}`);

    const submissionResponse = await fetch(submissionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (submissionResponse.ok) {
      const submissionData = await submissionResponse.json();
      console.log(`Successfully fetched submission data`);
      answersSource = 'quiz_submission';
      
      // Extract from submission_data - this contains individual question answers
      if (submissionData.quiz_submission?.submission_data) {
        console.log(`Processing submission_data with ${submissionData.quiz_submission.submission_data.length} items`);
        
        submissionData.quiz_submission.submission_data.forEach((item, index) => {
          const position = index + 1;
          const question = positionToQuestionMap.get(position) || questionIdMap.get(item.question_id?.toString());
          const questionType = question?.question_type || 'unknown';
          
          console.log(`Processing item ${position}:`, {
            question_id: item.question_id,
            question_type: questionType,
            answer_present: !!item.answer,
            text_present: !!item.text,
            answer_text_present: !!item.answer_text,
            answer_type: typeof item.answer,
            raw_item: item
          });

          // Extract answer using question type-specific logic
          const answer = extractAnswerByType(item, questionType);

          // Always include an entry for each question, even if no answer
          rawAnswers.push({
            submission_question_id: item.question_id || position,
            original_question_id: item.question_id || position,
            position_in_quiz: position,
            answer: answer,
            question_name: item.question_name,
            question_text: item.question_text,
            question_type: questionType,
            points: item.points,
            correct: item.correct,
            source: 'submission_data'
          });
        });
      }
    } else {
      console.log(`Quiz submission fetch failed: ${submissionResponse.status}`);
    }

    // STEP 4: Try the dedicated quiz submission questions endpoint
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
          answersSource = 'questions_api';
          
          rawQuestions.forEach((questionData, index) => {
            const question = questionIdMap.get(questionData.question_id?.toString()) || 
                           questionIdMap.get(questionData.id?.toString());
            const questionType = question?.question_type || questionData.question_type || 'unknown';
            
            console.log(`Processing questions API item ${index + 1}:`, {
              question_id: questionData.question_id,
              question_type: questionType,
              has_answer: !!questionData.answer,
              has_user_answer: !!questionData.user_answer,
              raw_data: questionData
            });

            const answer = extractAnswerByType(questionData, questionType);
            
            rawAnswers.push({
              submission_question_id: questionData.id,
              original_question_id: questionData.question_id || questionData.id,
              position_in_quiz: index + 1,
              answer: answer,
              question_name: questionData.question_name,
              question_text: questionData.question_text,
              question_type: questionType,
              points: questionData.points,
              correct: questionData.correct,
              source: 'questions_api'
            });
          });
        }
      } catch (error) {
        console.log(`Questions API failed: ${error.message}`);
      }
    }

    // STEP 5: For assignment-based quizzes, also try assignment submission as fallback
    if (isAssignmentBasedQuiz && quizData.assignment_id && userId && rawAnswers.length === 0) {
      console.log(`Trying assignment submission as fallback for New Quizzes`);
      
      const assignmentSubmissionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${quizData.assignment_id}/submissions/${userId}?include[]=submission_history&include[]=submission_comments`;
      
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
        answersSource = 'assignment_submission';
        
        // For assignment-based quizzes with only body content, map to first question
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

    // STEP 6: Try submission history for additional essay/matching data
    if (submissionResponse.ok) {
      try {
        const submissionData = await submissionResponse.json();
        
        if (submissionData.quiz_submission?.submission_history && Array.isArray(submissionData.quiz_submission.submission_history)) {
          console.log(`Checking submission history for additional answer data`);
          
          const latestHistory = submissionData.quiz_submission.submission_history[submissionData.quiz_submission.submission_history.length - 1];
          
          if (latestHistory?.submission_data) {
            latestHistory.submission_data.forEach((historyItem: any, index: number) => {
              const position = index + 1;
              const question = positionToQuestionMap.get(position) || questionIdMap.get(historyItem.question_id?.toString());
              const questionType = question?.question_type || 'unknown';
              
              // Check if we already have this answer from a better source
              const existingAnswer = rawAnswers.find(a => 
                a.original_question_id === historyItem.question_id || 
                a.position_in_quiz === position
              );
              
              if (!existingAnswer || !existingAnswer.answer) {
                console.log(`Found additional answer in history for question ${historyItem.question_id} (${questionType})`);
                
                const answer = extractAnswerByType(historyItem, questionType);
                
                if (existingAnswer) {
                  // Update existing answer
                  existingAnswer.answer = answer;
                  existingAnswer.source = 'submission_history';
                } else {
                  // Add new answer
                  rawAnswers.push({
                    submission_question_id: historyItem.question_id || position,
                    original_question_id: historyItem.question_id || position,
                    position_in_quiz: position,
                    answer: answer,
                    question_name: historyItem.question_name,
                    question_text: historyItem.question_text,
                    question_type: questionType,
                    points: historyItem.points,
                    correct: historyItem.correct,
                    source: 'submission_history'
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.log(`Failed to process submission history: ${error.message}`);
      }
    }

    // STEP 7: Map raw answers to actual questions
    const mappedAnswers = [];
    
    console.log(`Starting answer mapping process with ${rawAnswers.length} raw answers`);
    
    rawAnswers.forEach((rawAnswer, index) => {
      let matchedQuestion = null;
      let mappingStrategy = 'none';
      
      // Strategy 1: Direct question ID match
      matchedQuestion = questionIdMap.get(rawAnswer.original_question_id.toString());
      if (matchedQuestion) {
        mappingStrategy = 'direct_id';
      }
      
      // Strategy 2: Position-based match
      if (!matchedQuestion) {
        matchedQuestion = positionToQuestionMap.get(rawAnswer.position_in_quiz);
        if (matchedQuestion) {
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
        console.log(`Successfully mapped answer ${index + 1} to question ${matchedQuestion.id} (${matchedQuestion.question_name}) using ${mappingStrategy}`);
        
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
        console.log(`Could not map answer ${index + 1} for submission question ${rawAnswer.submission_question_id}`);
        
        // Include unmapped answers with their original IDs
        mappedAnswers.push({
          id: rawAnswer.submission_question_id,
          question_id: rawAnswer.submission_question_id,
          answer: rawAnswer.answer,
          question_name: rawAnswer.question_name || 'Unknown Question',
          question_text: rawAnswer.question_text || 'Question text not available',
          question_type: rawAnswer.question_type || 'unknown',
          points: rawAnswer.points,
          correct: rawAnswer.correct,
          source: rawAnswer.source,
          mapping_strategy: 'unmapped'
        });
      }
    });

    // STEP 8: Ensure we have entries for ALL questions, even if no answers
    const finalAnswers = [];
    const answersMap = new Map();
    
    // First, add all mapped answers
    mappedAnswers.forEach(answer => {
      const key = answer.question_id.toString();
      const hasContent = answer.answer && 
                        answer.answer !== null && 
                        answer.answer !== undefined && 
                        answer.answer !== '' && 
                        answer.answer.toString().trim() !== '';
      
      if (!answersMap.has(key) || (hasContent && !answersMap.get(key).hasContent)) {
        answersMap.set(key, { ...answer, hasContent });
      }
    });

    // Then, ensure all questions have entries (even if no answer)
    allQuestions.forEach(question => {
      const key = question.id.toString();
      if (!answersMap.has(key)) {
        console.log(`No answer found for question ${question.id} (${question.question_type}), creating empty entry`);
        answersMap.set(key, {
          id: question.id,
          question_id: question.id,
          answer: null,
          question_name: question.question_name,
          question_text: question.question_text,
          question_type: question.question_type,
          points: null,
          correct: null,
          source: 'no_answer',
          mapping_strategy: 'question_placeholder',
          hasContent: false
        });
      }
    });

    // Convert to final array
    Array.from(answersMap.values()).forEach(({ hasContent, ...answer }) => {
      finalAnswers.push(answer);
    });

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
          total_questions: allQuestions.length,
          total_raw_answers: rawAnswers.length,
          total_final_answers: finalAnswers.length,
          answers_with_content: finalAnswers.filter(a => a.answer && a.answer.toString().trim() !== '').length,
          answers_source: answersSource,
          is_assignment_based_quiz: isAssignmentBasedQuiz,
          assignment_id: quizData.assignment_id,
          question_mapping_created: questionIdMap.size > 0,
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
