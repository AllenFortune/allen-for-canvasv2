
import { CanvasCredentials, QuestionMaps, RawAnswer } from './types.ts';
import { extractAnswerByType } from './answer-extractor.ts';

// Helper function to check if content is effectively empty
const isContentEffectivelyEmpty = (content: any): boolean => {
  if (content === null || content === undefined) return true;
  if (typeof content === 'string') {
    const trimmed = content.trim();
    return trimmed === '' || trimmed === '<p></p>' || trimmed === '<br>' || trimmed === '&nbsp;';
  }
  if (Array.isArray(content)) return content.length === 0;
  if (typeof content === 'object') return Object.keys(content).length === 0;
  return false;
};

export const extractFromNewQuizzes = async (
  credentials: CanvasCredentials,
  courseId: string,
  assignmentId: number,
  submissionId: string,
  userId: number,
  questionMaps: QuestionMaps
): Promise<RawAnswer[]> => {
  const rawAnswers: RawAnswer[] = [];
  
  try {
    console.log(`Extracting answers from New Quizzes assignment ${assignmentId}`);
    
    // Get the assignment submission including history and comments
    const submissionUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}?include[]=submission_history&include[]=submission_comments`;
    
    const response = await fetch(submissionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`New Quizzes submission fetch failed: ${response.status}`);
      return rawAnswers;
    }

    const submissionData = await response.json();
    console.log('New Quizzes submission data retrieved');

    // Step 1: Attempt to parse submission.body as JSON first
    let answersFoundInBody = false;
    if (submissionData.body) {
      try {
        const bodyData = JSON.parse(submissionData.body);
        
        if (bodyData.responses || bodyData.answers) {
          const responses = bodyData.responses || bodyData.answers;
          console.log(`Found ${Object.keys(responses).length} responses in JSON body`);
          
          Object.entries(responses).forEach(([questionKey, answer], index) => {
            const questionId = parseInt(questionKey) || index + 1;
            const question = questionMaps.questionIdMap.get(questionId.toString()) || 
                           questionMaps.positionToQuestionMap.get(index + 1);
            
            rawAnswers.push({
              submission_question_id: questionId,
              original_question_id: questionId,
              position_in_quiz: index + 1,
              answer: answer,
              question_name: question?.question_name || `Question ${questionId}`,
              question_text: question?.question_text || '',
              question_type: question?.question_type || 'short_answer_question',
              points: null,
              correct: null,
              source: 'new_quizzes_json_body'
            });
          });
          answersFoundInBody = true;
          console.log(`Extracted ${rawAnswers.length} answers from New Quizzes JSON body`);
        }
      } catch (parseError) {
        console.log('New Quizzes body is not JSON, will try alternative extraction methods');
        
        // For non-JSON body, try to extract essay answers if it's a single essay question
        const essayQuestions = questionMaps.allQuestions.filter(q => q.question_type === 'essay_question');
        if (essayQuestions.length === 1 && submissionData.body.trim()) {
          console.log('Treating non-JSON body as essay answer for single essay question');
          rawAnswers.push({
            submission_question_id: essayQuestions[0].id,
            original_question_id: essayQuestions[0].id,
            position_in_quiz: 1,
            answer: submissionData.body,
            question_name: essayQuestions[0].question_name,
            question_text: essayQuestions[0].question_text,
            question_type: 'essay_question',
            points: null,
            correct: null,
            source: 'new_quizzes_text_body'
          });
          answersFoundInBody = true;
        }
      }
    }

    // Step 2: Check submission history for additional answers
    if (submissionData.submission_history && submissionData.submission_history.length > 0) {
      console.log(`Checking ${submissionData.submission_history.length} submission history entries`);
      
      for (const historyEntry of submissionData.submission_history) {
        if (historyEntry.body && historyEntry.body !== submissionData.body) {
          try {
            const historyData = JSON.parse(historyEntry.body);
            if (historyData.responses || historyData.answers) {
              const responses = historyData.responses || historyData.answers;
              console.log(`Found ${Object.keys(responses).length} responses in history entry`);
              
              Object.entries(responses).forEach(([questionKey, answer], index) => {
                const questionId = parseInt(questionKey) || index + 1;
                const existingAnswer = rawAnswers.find(a => a.original_question_id === questionId);
                
                if (!existingAnswer || isContentEffectivelyEmpty(existingAnswer.answer)) {
                  const question = questionMaps.questionIdMap.get(questionId.toString()) || 
                                 questionMaps.positionToQuestionMap.get(index + 1);
                  
                  if (existingAnswer) {
                    existingAnswer.answer = answer;
                    existingAnswer.source = 'new_quizzes_history_update';
                  } else {
                    rawAnswers.push({
                      submission_question_id: questionId,
                      original_question_id: questionId,
                      position_in_quiz: index + 1,
                      answer: answer,
                      question_name: question?.question_name || `Question ${questionId}`,
                      question_text: question?.question_text || '',
                      question_type: question?.question_type || 'short_answer_question',
                      points: null,
                      correct: null,
                      source: 'new_quizzes_history_new'
                    });
                  }
                }
              });
            }
          } catch (historyParseError) {
            console.log('History entry body is not JSON, trying text extraction');
            
            // Check if this might be an essay answer
            const essayQuestions = questionMaps.allQuestions.filter(q => q.question_type === 'essay_question');
            if (essayQuestions.length > 0 && historyEntry.body.trim()) {
              for (const essayQuestion of essayQuestions) {
                const existingAnswer = rawAnswers.find(a => a.original_question_id === essayQuestion.id);
                if (!existingAnswer || isContentEffectivelyEmpty(existingAnswer.answer)) {
                  if (existingAnswer) {
                    existingAnswer.answer = historyEntry.body;
                    existingAnswer.source = 'new_quizzes_history_text';
                  } else {
                    rawAnswers.push({
                      submission_question_id: essayQuestion.id,
                      original_question_id: essayQuestion.id,
                      position_in_quiz: essayQuestion.position || 1,
                      answer: historyEntry.body,
                      question_name: essayQuestion.question_name,
                      question_text: essayQuestion.question_text,
                      question_type: 'essay_question',
                      points: null,
                      correct: null,
                      source: 'new_quizzes_history_text'
                    });
                  }
                  break; // Only assign to first essay question to avoid duplicates
                }
              }
            }
          }
        }
      }
    }

    // Step 3: Try quiz submission questions API for missing essay answers
    const essayQuestions = questionMaps.allQuestions.filter(q => q.question_type === 'essay_question');
    const missingEssayAnswers = essayQuestions.filter(q => {
      const existing = rawAnswers.find(a => a.original_question_id === q.id);
      return !existing || isContentEffectivelyEmpty(existing.answer);
    });

    if (missingEssayAnswers.length > 0) {
      console.log(`Attempting quiz_submission_questions API for ${missingEssayAnswers.length} missing essay answers`);
      
      try {
        const questionsApiUrl = `${credentials.canvas_instance_url}/api/v1/quiz_submissions/${submissionId}/questions`;
        const questionsResponse = await fetch(questionsApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${credentials.canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          const questionItems = questionsData.quiz_submission_questions || [];
          console.log(`Found ${questionItems.length} items in quiz_submission_questions`);

          questionItems.forEach((qItem: any) => {
            const question = questionMaps.questionIdMap.get(qItem.question_id?.toString()) || 
                           questionMaps.questionIdMap.get(qItem.id?.toString());
            
            if (question && question.question_type === 'essay_question') {
              const existingAnswer = rawAnswers.find(a => a.original_question_id === question.id);
              const extractedAnswer = extractAnswerByType(qItem, 'essay_question');
              
              if (extractedAnswer && !isContentEffectivelyEmpty(extractedAnswer)) {
                if (existingAnswer && isContentEffectivelyEmpty(existingAnswer.answer)) {
                  existingAnswer.answer = extractedAnswer;
                  existingAnswer.source = 'new_quizzes_questions_api';
                } else if (!existingAnswer) {
                  rawAnswers.push({
                    submission_question_id: qItem.id || question.id,
                    original_question_id: question.id,
                    position_in_quiz: question.position || 1,
                    answer: extractedAnswer,
                    question_name: question.question_name,
                    question_text: question.question_text,
                    question_type: 'essay_question',
                    points: qItem.points,
                    correct: qItem.correct,
                    source: 'new_quizzes_questions_api'
                  });
                }
              }
            }
          });
        }
      } catch (questionsApiError) {
        console.log(`Quiz submission questions API failed: ${questionsApiError.message}`);
      }
    }

    // Step 4: Try submission events for essay questions (final fallback)
    if (missingEssayAnswers.length > 0) {
      console.log('Trying submission events for remaining missing essay answers');
      
      try {
        const eventsUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${submissionId}/submissions/${submissionId}/events`;
        const eventsResponse = await fetch(eventsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${credentials.canvas_access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (eventsData.quiz_submission_events) {
            console.log(`Found ${eventsData.quiz_submission_events.length} submission events`);
            
            eventsData.quiz_submission_events.forEach((event: any) => {
              if (event.event_type === 'question_answered' && event.event_data) {
                const questionId = event.event_data.question_id;
                const question = questionMaps.questionIdMap.get(questionId?.toString());
                
                if (question && question.question_type === 'essay_question') {
                  const existingAnswer = rawAnswers.find(a => a.original_question_id === questionId);
                  const eventAnswer = event.event_data.answer || event.event_data.text || event.event_data.response;
                  
                  if (eventAnswer && !isContentEffectivelyEmpty(eventAnswer)) {
                    if (existingAnswer && isContentEffectivelyEmpty(existingAnswer.answer)) {
                      existingAnswer.answer = eventAnswer;
                      existingAnswer.source = 'new_quizzes_events';
                    } else if (!existingAnswer) {
                      rawAnswers.push({
                        submission_question_id: questionId,
                        original_question_id: questionId,
                        position_in_quiz: question.position || 1,
                        answer: eventAnswer,
                        question_name: question.question_name,
                        question_text: question.question_text,
                        question_type: 'essay_question',
                        points: null,
                        correct: null,
                        source: 'new_quizzes_events'
                      });
                    }
                  }
                }
              }
            });
          }
        }
      } catch (eventsError) {
        console.log(`Submission events failed: ${eventsError.message}`);
      }
    }

    // Step 5: Deduplication - ensure we have the best answer for each question
    const finalAnswersMap = new Map<number, RawAnswer>();
    
    for (const answer of rawAnswers) {
      const questionId = typeof answer.original_question_id === 'string' ? 
        parseInt(answer.original_question_id) : answer.original_question_id;
      
      if (!finalAnswersMap.has(questionId)) {
        finalAnswersMap.set(questionId, answer);
      } else {
        const existing = finalAnswersMap.get(questionId);
        // Prioritize answers with actual content over empty ones
        if (existing && isContentEffectivelyEmpty(existing.answer) && !isContentEffectivelyEmpty(answer.answer)) {
          finalAnswersMap.set(questionId, answer);
        }
      }
    }

    const deduplicatedAnswers = Array.from(finalAnswersMap.values());
    console.log(`Extracted ${deduplicatedAnswers.length} unique answers after deduplication for New Quizzes`);
    
    const answersWithContent = deduplicatedAnswers.filter(a => !isContentEffectivelyEmpty(a.answer));
    console.log(`Found ${answersWithContent.length}/${deduplicatedAnswers.length} answers with actual content`);

    return deduplicatedAnswers;

  } catch (error) {
    console.error('Error extracting from New Quizzes:', error);
    return rawAnswers;
  }
};
