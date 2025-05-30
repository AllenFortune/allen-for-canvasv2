
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionDisplay from './quiz-details/QuestionDisplay';
import StudentAnswerSection from './quiz-details/StudentAnswerSection';
import DebugInfo from './quiz-details/DebugInfo';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
  question_name?: string;
  question_text?: string;
}

interface QuizQuestionDetailsProps {
  selectedQuestionId: number | null;
  questions: QuizQuestion[];
  submissionAnswers: SubmissionAnswer[];
  loadingAnswers: boolean;
  answersError: string;
  onRetryAnswers: () => void;
}

const QuizQuestionDetails: React.FC<QuizQuestionDetailsProps> = ({
  selectedQuestionId,
  questions,
  submissionAnswers,
  loadingAnswers,
  answersError,
  onRetryAnswers
}) => {
  const getAnswerForQuestion = (questionId: number) => {
    return submissionAnswers.find(answer => answer.question_id === questionId);
  };

  if (!selectedQuestionId) {
    return null;
  }

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const answer = getAnswerForQuestion(selectedQuestionId);
  
  if (!selectedQuestion) return null;

  console.log('Rendering answer content for:', {
    answer,
    questionType: selectedQuestion.question_type,
    hasAnswer: !!answer,
    answerValue: answer?.answer,
    answerType: typeof answer?.answer
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Details & Student Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <QuestionDisplay question={selectedQuestion} />
          
          <DebugInfo 
            submissionAnswers={submissionAnswers}
            answer={answer}
            selectedQuestion={selectedQuestion}
          />

          <StudentAnswerSection
            answer={answer}
            questionType={selectedQuestion.question_type}
            loadingAnswers={loadingAnswers}
            answersError={answersError}
            onRetryAnswers={onRetryAnswers}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestionDetails;
