
import { CanvasCredentials } from './types.ts';

export interface QuizTypeInfo {
  isNewQuizzes: boolean;
  assignmentId?: number;
  quizType: 'classic' | 'new_quizzes';
  apiEndpoints: {
    submissions: string;
    questions: string;
    answers: string;
  };
}

export const detectQuizType = async (
  credentials: CanvasCredentials,
  courseId: string,
  quizId: string
): Promise<QuizTypeInfo> => {
  try {
    const quizUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}`;
    
    const response = await fetch(quizUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz details: ${response.status}`);
    }

    const quizData = await response.json();
    const isNewQuizzes = !!quizData.assignment_id;
    
    console.log(`Quiz type detected: ${isNewQuizzes ? 'New Quizzes' : 'Classic Quiz'}`);
    console.log(`Assignment ID: ${quizData.assignment_id || 'None'}`);

    return {
      isNewQuizzes,
      assignmentId: quizData.assignment_id,
      quizType: isNewQuizzes ? 'new_quizzes' : 'classic',
      apiEndpoints: {
        submissions: isNewQuizzes 
          ? `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${quizData.assignment_id}/submissions`
          : `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions`,
        questions: `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions`,
        answers: isNewQuizzes
          ? `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${quizData.assignment_id}/submissions`
          : `${credentials.canvas_instance_url}/api/v1/quiz_submissions`
      }
    };
  } catch (error) {
    console.error('Error detecting quiz type:', error);
    // Default to classic quiz if detection fails
    return {
      isNewQuizzes: false,
      quizType: 'classic',
      apiEndpoints: {
        submissions: `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions`,
        questions: `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions`,
        answers: `${credentials.canvas_instance_url}/api/v1/quiz_submissions`
      }
    };
  }
};
