
import { CanvasCredentials, QuestionMaps, RawAnswer } from './types.ts';
import { extractAnswerByType } from './answer-extractor.ts';

export const extractFromSubmissionData = async (
  credentials: CanvasCredentials,
  courseId: string,
  quizId: string,
  submissionId: string,
  questionMaps: QuestionMaps
): Promise<{ rawAnswers: RawAnswer[]; submissionData: any; answersSource: string }> => {
  const { questionIdMap, positionToQuestionMap } = questionMaps;
  let rawAnswers: RawAnswer[] = [];
  let answersSource = 'unknown';
  let submissionData = null;

  console.log(`Fetching quiz submission data for all questions`);
  
  const submissionUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}?include[]=submission&include[]=quiz&include[]=user&include[]=submission_questions&include[]=submission_history`;
  console.log(`Quiz submission URL: ${submissionUrl}`);

  const submissionResponse = await fetch(submissionUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credentials.canvas_access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (submissionResponse.ok) {
    submissionData = await submissionResponse.json();
    console.log(`Successfully fetched submission data`);
    answersSource = 'quiz_submission';
    
    if (submissionData.quiz_submission?.submission_data) {
      console.log(`Processing submission_data with ${submissionData.quiz_submission.submission_data.length} items`);
      
      submissionData.quiz_submission.submission_data.forEach((item: any, index: number) => {
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

        const answer = extractAnswerByType(item, questionType);

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

  return { rawAnswers, submissionData, answersSource };
};

export const extractFromQuestionsAPI = async (
  credentials: CanvasCredentials,
  submissionId: string,
  questionMaps: QuestionMaps
): Promise<RawAnswer[]> => {
  const { questionIdMap } = questionMaps;
  const rawAnswers: RawAnswer[] = [];

  const questionsApiUrl = `${credentials.canvas_instance_url}/api/v1/quiz_submissions/${submissionId}/questions`;
  console.log(`Trying dedicated questions endpoint: ${questionsApiUrl}`);

  try {
    const questionsApiResponse = await fetch(questionsApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (questionsApiResponse.ok) {
      const questionsApiData = await questionsApiResponse.json();
      const rawQuestions = questionsApiData.quiz_submission_questions || [];
      console.log(`Questions API returned ${rawQuestions.length} questions`);
      
      rawQuestions.forEach((questionData: any, index: number) => {
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

  return rawAnswers;
};
