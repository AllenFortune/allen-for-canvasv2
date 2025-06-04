
import { CanvasCredentials, QuestionMaps, RawAnswer } from './types.ts';
import { extractAnswerByType } from './answer-extractor.ts';

export const extractEssayAnswers = async (
  credentials: CanvasCredentials,
  courseId: string,
  quizId: string,
  submissionId: string,
  questionMaps: QuestionMaps,
  submissionData: any,
  rawAnswers: RawAnswer[]
): Promise<void> => {
  const { allQuestions, questionIdMap, positionToQuestionMap } = questionMaps;

  if (!allQuestions.some(q => q.question_type === 'essay_question')) {
    return;
  }

  console.log('Found essay questions, trying additional extraction methods');
  
  // Try submission events endpoint
  try {
    const eventsUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/events`;
    console.log(`Trying submission events for essay data: ${eventsUrl}`);
    
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
      console.log('Events data:', JSON.stringify(eventsData, null, 2));
      
      if (eventsData.quiz_submission_events) {
        eventsData.quiz_submission_events.forEach((event: any) => {
          if (event.event_type === 'question_answered' && event.event_data) {
            const questionId = event.event_data.question_id;
            const question = questionIdMap.get(questionId.toString());
            
            if (question && question.question_type === 'essay_question') {
              console.log(`Found essay answer in events for question ${questionId}`);
              
              const existingAnswer = rawAnswers.find(a => 
                a.original_question_id === questionId || 
                a.submission_question_id === questionId
              );
              
              const eventAnswer = event.event_data.answer || event.event_data.text || event.event_data.response;
              
              if (eventAnswer && (!existingAnswer || !existingAnswer.answer)) {
                if (existingAnswer) {
                  existingAnswer.answer = eventAnswer;
                  existingAnswer.source = 'submission_events';
                } else {
                  rawAnswers.push({
                    submission_question_id: questionId,
                    original_question_id: questionId,
                    position_in_quiz: allQuestions.findIndex(q => q.id === questionId) + 1,
                    answer: eventAnswer,
                    question_name: question.question_name,
                    question_text: question.question_text,
                    question_type: 'essay_question',
                    points: null,
                    correct: null,
                    source: 'submission_events'
                  });
                }
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.log(`Submission events failed: ${error.message}`);
  }

  // Try quiz submission attempts endpoint
  try {
    const attemptNumber = submissionData?.quiz_submission?.attempt || 1;
    const attemptUrl = `${credentials.canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/attempts/${attemptNumber}`;
    console.log(`Trying specific attempt endpoint: ${attemptUrl}`);
    
    const attemptResponse = await fetch(attemptUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (attemptResponse.ok) {
      const attemptData = await attemptResponse.json();
      console.log('Attempt data structure:', Object.keys(attemptData));
      
      if (attemptData.quiz_submission_questions) {
        attemptData.quiz_submission_questions.forEach((q: any, index: number) => {
          const question = questionIdMap.get(q.question_id?.toString()) || 
                          questionIdMap.get(q.id?.toString());
          
          if (question && question.question_type === 'essay_question') {
            console.log(`Processing essay question from attempt data:`, q);
            
            const existingAnswer = rawAnswers.find(a => 
              a.original_question_id === question.id || 
              a.submission_question_id === question.id
            );
            
            const attemptAnswer = extractAnswerByType(q, 'essay_question');
            
            if (attemptAnswer && (!existingAnswer || !existingAnswer.answer)) {
              if (existingAnswer) {
                existingAnswer.answer = attemptAnswer;
                existingAnswer.source = 'attempt_data';
              } else {
                rawAnswers.push({
                  submission_question_id: question.id,
                  original_question_id: question.id,
                  position_in_quiz: index + 1,
                  answer: attemptAnswer,
                  question_name: question.question_name,
                  question_text: question.question_text,
                  question_type: 'essay_question',
                  points: q.points,
                  correct: q.correct,
                  source: 'attempt_data'
                });
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.log(`Attempt endpoint failed: ${error.message}`);
  }

  // Try raw Canvas quiz data endpoint
  try {
    const rawQuizUrl = `${credentials.canvas_instance_url}/api/v1/quiz_submissions/${submissionId}?include[]=submission&include[]=quiz&include[]=user`;
    console.log(`Trying raw quiz submission endpoint: ${rawQuizUrl}`);
    
    const rawQuizResponse = await fetch(rawQuizUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (rawQuizResponse.ok) {
      const rawQuizData = await rawQuizResponse.json();
      console.log('Raw quiz data structure:', Object.keys(rawQuizData));
      
      if (rawQuizData.quiz_submissions && rawQuizData.quiz_submissions[0]) {
        const rawSubmission = rawQuizData.quiz_submissions[0];
        
        if (rawSubmission.submission_data) {
          console.log('Found submission_data in raw quiz response');
          
          rawSubmission.submission_data.forEach((item: any, index: number) => {
            const question = positionToQuestionMap.get(index + 1) || 
                            questionIdMap.get(item.question_id?.toString());
            
            if (question && question.question_type === 'essay_question') {
              const existingAnswer = rawAnswers.find(a => 
                a.original_question_id === question.id
              );
              
              const rawAnswer = extractAnswerByType(item, 'essay_question');
              
              if (rawAnswer && (!existingAnswer || !existingAnswer.answer)) {
                console.log(`Found essay answer in raw data for question ${question.id}`);
                
                if (existingAnswer) {
                  existingAnswer.answer = rawAnswer;
                  existingAnswer.source = 'raw_quiz_data';
                } else {
                  rawAnswers.push({
                    submission_question_id: question.id,
                    original_question_id: question.id,
                    position_in_quiz: index + 1,
                    answer: rawAnswer,
                    question_name: question.question_name,
                    question_text: question.question_text,
                    question_type: 'essay_question',
                    points: item.points,
                    correct: item.correct,
                    source: 'raw_quiz_data'
                  });
                }
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.log(`Raw quiz endpoint failed: ${error.message}`);
  }
};
