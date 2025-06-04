
import { CanvasCredentials, CanvasQuestion, QuestionMaps } from './types.ts';

export const fetchQuizQuestions = async (
  credentials: CanvasCredentials,
  courseId: string,
  quizId: string
): Promise<QuestionMaps> => {
  const questionsUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions?per_page=100`;
  console.log(`Fetching quiz questions for comprehensive mapping: ${questionsUrl}`);
  
  const response = await fetch(questionsUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credentials.canvas_access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  const questionIdMap = new Map<string, CanvasQuestion>();
  const positionToQuestionMap = new Map<number, CanvasQuestion>();
  let allQuestions: CanvasQuestion[] = [];
  
  if (response.ok) {
    allQuestions = await response.json();
    console.log(`Found ${allQuestions.length} quiz questions`);
    
    allQuestions.forEach((question, index) => {
      const position = index + 1;
      
      questionIdMap.set(question.id.toString(), question);
      questionIdMap.set(position.toString(), question);
      positionToQuestionMap.set(position, question);
      
      console.log(`Question mapping: Position ${position} = Question ID ${question.id} (${question.question_type}) - "${question.question_name || question.question_text?.substring(0, 50)}..."`);
    });
  } else {
    console.error(`Failed to fetch quiz questions: ${response.status}`);
  }

  return { questionIdMap, positionToQuestionMap, allQuestions };
};

export const fetchQuizDetails = async (
  credentials: CanvasCredentials,
  courseId: string,
  quizId: string
) => {
  const quizUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}`;
  console.log(`Fetching quiz details: ${quizUrl}`);

  const response = await fetch(quizUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credentials.canvas_access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Canvas API error fetching quiz: ${response.status} - ${errorText}`);
    
    let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
    if (response.status === 401) {
      errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
    } else if (response.status === 404) {
      errorMessage = 'Quiz not found or access denied.';
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};
