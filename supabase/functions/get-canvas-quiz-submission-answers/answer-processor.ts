
import { CanvasCredentials, QuestionMaps, RawAnswer, ProcessedAnswer } from './types.ts';
import { extractAnswerByType } from './answer-extractor.ts';

export const processSubmissionHistory = async (
  submissionData: any,
  questionMaps: QuestionMaps,
  rawAnswers: RawAnswer[]
): Promise<void> => {
  const { positionToQuestionMap, questionIdMap } = questionMaps;

  try {
    if (submissionData.quiz_submission?.submission_history && Array.isArray(submissionData.quiz_submission.submission_history)) {
      console.log(`Checking submission history for additional answer data`);
      
      const latestHistory = submissionData.quiz_submission.submission_history[submissionData.quiz_submission.submission_history.length - 1];
      
      if (latestHistory?.submission_data) {
        latestHistory.submission_data.forEach((historyItem: any, index: number) => {
          const position = index + 1;
          const question = positionToQuestionMap.get(position) || questionIdMap.get(historyItem.question_id?.toString());
          const questionType = question?.question_type || 'unknown';
          
          const existingAnswer = rawAnswers.find(a => 
            a.original_question_id === historyItem.question_id || 
            a.position_in_quiz === position
          );
          
          if (!existingAnswer || !existingAnswer.answer) {
            console.log(`Found additional answer in history for question ${historyItem.question_id} (${questionType})`);
            
            const answer = extractAnswerByType(historyItem, questionType);
            
            if (existingAnswer) {
              existingAnswer.answer = answer;
              existingAnswer.source = 'submission_history';
            } else {
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
};

export const mapAnswersToQuestions = (
  rawAnswers: RawAnswer[],
  questionMaps: QuestionMaps
): ProcessedAnswer[] => {
  const { questionIdMap, positionToQuestionMap, allQuestions } = questionMaps;
  const mappedAnswers: ProcessedAnswer[] = [];
  
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
      
      mappedAnswers.push({
        id: Number(rawAnswer.submission_question_id),
        question_id: Number(rawAnswer.submission_question_id),
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

  return mappedAnswers;
};

export const ensureAllQuestionsHaveEntries = (
  mappedAnswers: ProcessedAnswer[],
  allQuestions: any[]
): ProcessedAnswer[] => {
  const finalAnswers: ProcessedAnswer[] = [];
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

  return finalAnswers;
};
