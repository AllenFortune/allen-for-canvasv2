
import { CanvasCredentials, QuestionMaps, RawAnswer } from './types.ts';
import { extractAnswerByType } from './answer-extractor.ts';

// Enhanced content validation to prevent extracting metadata or teacher info
const isValidStudentContent = (content: any): boolean => {
  if (content === null || content === undefined) return false;
  
  if (typeof content === 'string') {
    const trimmed = content.trim();
    
    // Check for empty content
    if (trimmed === '' || trimmed === '<p></p>' || trimmed === '<br>' || trimmed === '&nbsp;') {
      return false;
    }
    
    // Check for teacher/metadata patterns that should be rejected
    const invalidPatterns = [
      /^[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]+$/, // Email addresses
      /^[a-zA-Z]+\s*[a-zA-Z]*$/, // Single words or names like "shawnjackson"
      /^user_\d+$/, // User IDs
      /^submission_\d+$/, // Submission IDs
      /^course_\d+$/, // Course IDs
      /^quiz_\d+$/, // Quiz IDs
      /^assignment_\d+$/, // Assignment IDs
      /^\d+$/, // Pure numbers
      /^(true|false|null|undefined)$/i, // Boolean/null strings
      /^<\?xml/, // XML declarations
      /^<!DOCTYPE/, // HTML DOCTYPE
      /^<html/, // HTML tags
      /canvas_instance_url/, // Canvas config
      /access_token/, // Token references
    ];
    
    // Reject content matching invalid patterns
    if (invalidPatterns.some(pattern => pattern.test(trimmed))) {
      console.log(`[NewQuizzesExtractor] Rejected invalid content pattern: "${trimmed.substring(0, 100)}"`);
      return false;
    }
    
    // Content should be substantial for essays (minimum 10 characters)
    if (trimmed.length < 10) {
      console.log(`[NewQuizzesExtractor] Rejected content too short: "${trimmed}"`);
      return false;
    }
    
    return true;
  }
  
  if (Array.isArray(content)) return content.length > 0;
  if (typeof content === 'object') return Object.keys(content).length > 0;
  return false;
};

// Helper function to check if content is effectively empty
const isContentEffectivelyEmpty = (content: any): boolean => {
  return !isValidStudentContent(content);
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
    console.log(`[NewQuizzesExtractor] Extracting answers from New Quizzes assignment ${assignmentId} for user ${userId}`);
    
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
      console.log(`[NewQuizzesExtractor] New Quizzes submission fetch failed: ${response.status}`);
      return rawAnswers;
    }

    const submissionData = await response.json();
    console.log('[NewQuizzesExtractor] New Quizzes submission data retrieved');

    // Step 1: Attempt to parse submission.body as JSON first
    let answersFoundInBody = false;
    if (submissionData.body) {
      try {
        const bodyData = JSON.parse(submissionData.body);
        
        if (bodyData.responses || bodyData.answers) {
          const responses = bodyData.responses || bodyData.answers;
          console.log(`[NewQuizzesExtractor] Found ${Object.keys(responses).length} responses in JSON body`);
          
          Object.entries(responses).forEach(([questionKey, answer], index) => {
            const questionId = parseInt(questionKey) || index + 1;
            const question = questionMaps.questionIdMap.get(questionId.toString()) || 
                           questionMaps.positionToQuestionMap.get(index + 1);
            
            if (question && isValidStudentContent(answer)) {
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
            }
          });
          answersFoundInBody = true;
          console.log(`[NewQuizzesExtractor] Extracted ${rawAnswers.length} valid answers from New Quizzes JSON body`);
        }
      } catch (parseError) {
        console.log('[NewQuizzesExtractor] New Quizzes body is not JSON, will try alternative extraction methods');
        // CRITICAL: Do NOT treat non-JSON body as plain text answer
        // This was the source of the "shawnjackson" issue
      }
    }

    // Step 2: Enhanced submission history processing with proper question mapping
    if (submissionData.submission_history && submissionData.submission_history.length > 0) {
      console.log(`[NewQuizzesExtractor] Checking ${submissionData.submission_history.length} submission history entries`);
      
      for (const historyEntry of submissionData.submission_history) {
        // Check for JSON body in history
        if (historyEntry.body && historyEntry.body !== submissionData.body) {
          try {
            const historyData = JSON.parse(historyEntry.body);
            if (historyData.responses || historyData.answers) {
              const responses = historyData.responses || historyData.answers;
              console.log(`[NewQuizzesExtractor] Found ${Object.keys(responses).length} responses in history entry`);
              
              Object.entries(responses).forEach(([questionKey, answer], index) => {
                const questionId = parseInt(questionKey) || index + 1;
                const existingAnswer = rawAnswers.find(a => a.original_question_id === questionId);
                
                if (isValidStudentContent(answer) && (!existingAnswer || isContentEffectivelyEmpty(existingAnswer.answer))) {
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
            console.log('[NewQuizzesExtractor] History entry body is not JSON, checking for essay content');
            
            // Only for essay questions, check if history body contains valid essay content
            const essayQuestions = questionMaps.allQuestions.filter(q => q.question_type === 'essay_question');
            if (essayQuestions.length > 0 && isValidStudentContent(historyEntry.body)) {
              for (const essayQuestion of essayQuestions) {
                const existingAnswer = rawAnswers.find(a => a.original_question_id === essayQuestion.id);
                if (!existingAnswer || isContentEffectivelyEmpty(existingAnswer.answer)) {
                  console.log(`[NewQuizzesExtractor] Found valid essay content in history for question ${essayQuestion.id}`);
                  if (existingAnswer) {
                    existingAnswer.answer = historyEntry.body;
                    existingAnswer.source = 'new_quizzes_history_essay';
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
                      source: 'new_quizzes_history_essay'
                    });
                  }
                  break; // Only assign to first essay question to avoid duplicates
                }
              }
            }
          }
        }

        // Check submission_data within history
        if (historyEntry.submission_data && Array.isArray(historyEntry.submission_data)) {
          console.log(`[NewQuizzesExtractor] Processing ${historyEntry.submission_data.length} submission_data items from history`);
          
          historyEntry.submission_data.forEach((item: any) => {
            const question = questionMaps.questionIdMap.get(item.question_id?.toString());
            if (question) {
              const existingAnswer = rawAnswers.find(a => a.original_question_id === question.id);
              const extractedAnswer = extractAnswerByType(item, question.question_type);
              
              if (isValidStudentContent(extractedAnswer) && (!existingAnswer || isContentEffectivelyEmpty(existingAnswer.answer))) {
                if (existingAnswer) {
                  existingAnswer.answer = extractedAnswer;
                  existingAnswer.source = 'new_quizzes_submission_data';
                } else {
                  rawAnswers.push({
                    submission_question_id: item.id || question.id,
                    original_question_id: question.id,
                    position_in_quiz: question.position || 1,
                    answer: extractedAnswer,
                    question_name: question.question_name,
                    question_text: question.question_text,
                    question_type: question.question_type,
                    points: item.points,
                    correct: item.correct,
                    source: 'new_quizzes_submission_data'
                  });
                }
              }
            }
          });
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
      console.log(`[NewQuizzesExtractor] Attempting quiz_submission_questions API for ${missingEssayAnswers.length} missing essay answers`);
      
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
          console.log(`[NewQuizzesExtractor] Found ${questionItems.length} items in quiz_submission_questions`);

          questionItems.forEach((qItem: any) => {
            const question = questionMaps.questionIdMap.get(qItem.question_id?.toString()) || 
                           questionMaps.questionIdMap.get(qItem.id?.toString());
            
            if (question && question.question_type === 'essay_question') {
              const existingAnswer = rawAnswers.find(a => a.original_question_id === question.id);
              const extractedAnswer = extractAnswerByType(qItem, 'essay_question');
              
              if (isValidStudentContent(extractedAnswer)) {
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
        console.log(`[NewQuizzesExtractor] Quiz submission questions API failed: ${questionsApiError.message}`);
      }
    }

    // Step 4: Final deduplication with content priority
    const finalAnswersMap = new Map<number, RawAnswer>();
    
    for (const answer of rawAnswers) {
      const questionId = typeof answer.original_question_id === 'string' ? 
        parseInt(answer.original_question_id) : answer.original_question_id;
      
      if (!finalAnswersMap.has(questionId)) {
        finalAnswersMap.set(questionId, answer);
      } else {
        const existing = finalAnswersMap.get(questionId);
        // Prioritize answers with valid content over empty ones
        if (existing && isContentEffectivelyEmpty(existing.answer) && isValidStudentContent(answer.answer)) {
          finalAnswersMap.set(questionId, answer);
        }
      }
    }

    const deduplicatedAnswers = Array.from(finalAnswersMap.values());
    console.log(`[NewQuizzesExtractor] Extracted ${deduplicatedAnswers.length} unique answers after deduplication for New Quizzes`);
    
    const answersWithContent = deduplicatedAnswers.filter(a => isValidStudentContent(a.answer));
    console.log(`[NewQuizzesExtractor] Found ${answersWithContent.length}/${deduplicatedAnswers.length} answers with valid student content`);

    return deduplicatedAnswers;

  } catch (error) {
    console.error('[NewQuizzesExtractor] Error extracting from New Quizzes:', error);
    return rawAnswers;
  }
};
