
import { CanvasCredentials, QuestionMaps, RawAnswer } from './types.ts';

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
    
    // Get the assignment submission
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

    // For New Quizzes, we often get a JSON body with quiz responses
    if (submissionData.body) {
      try {
        // Try to parse as JSON first (common for New Quizzes)
        const bodyData = JSON.parse(submissionData.body);
        
        if (bodyData.responses || bodyData.answers) {
          const responses = bodyData.responses || bodyData.answers;
          
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
              source: 'new_quizzes_json'
            });
          });
        }
      } catch (parseError) {
        // If not JSON, treat as plain text (could be essay or short answer)
        console.log('New Quizzes body is not JSON, treating as text response');
        
        const firstQuestion = questionMaps.allQuestions[0];
        if (firstQuestion) {
          rawAnswers.push({
            submission_question_id: firstQuestion.id,
            original_question_id: firstQuestion.id,
            position_in_quiz: 1,
            answer: submissionData.body,
            question_name: firstQuestion.question_name,
            question_text: firstQuestion.question_text,
            question_type: firstQuestion.question_type,
            points: null,
            correct: null,
            source: 'new_quizzes_text'
          });
        }
      }
    }

    // Also check submission history for additional data
    if (submissionData.submission_history) {
      const latestSubmission = submissionData.submission_history[submissionData.submission_history.length - 1];
      if (latestSubmission?.body && latestSubmission.body !== submissionData.body) {
        console.log('Found additional data in submission history');
        
        try {
          const historyData = JSON.parse(latestSubmission.body);
          if (historyData.responses) {
            Object.entries(historyData.responses).forEach(([questionKey, answer], index) => {
              const questionId = parseInt(questionKey) || index + 1;
              const existingAnswer = rawAnswers.find(a => a.original_question_id === questionId);
              
              if (!existingAnswer) {
                const question = questionMaps.questionIdMap.get(questionId.toString());
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
                  source: 'new_quizzes_history'
                });
              }
            });
          }
        } catch (historyParseError) {
          console.log('Could not parse submission history as JSON');
        }
      }
    }

    console.log(`Extracted ${rawAnswers.length} answers from New Quizzes`);
    return rawAnswers;

  } catch (error) {
    console.error('Error extracting from New Quizzes:', error);
    return rawAnswers;
  }
};
