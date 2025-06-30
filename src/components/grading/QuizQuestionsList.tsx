
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import QuizQuestionsHeader from './quiz-questions/QuizQuestionsHeader';
import QuizQuestionsErrorAlert from './quiz-questions/QuizQuestionsErrorAlert';
import QuizQuestionsEmptyState from './quiz-questions/QuizQuestionsEmptyState';
import QuizQuestionButton from './quiz-questions/QuizQuestionButton';
import QuizQuestionsInfoAlerts from './quiz-questions/QuizQuestionsInfoAlerts';

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
}

interface QuizQuestionsListProps {
  questions: QuizQuestion[];
  selectedQuestionId: number | null;
  onQuestionSelect: (questionId: number) => void;
  submissionAnswers: SubmissionAnswer[];
  loadingAnswers: boolean;
  answersError: string;
  onRetryAnswers: () => void;
  manualGradingQuestions?: QuizQuestion[];
}

const QuizQuestionsList: React.FC<QuizQuestionsListProps> = ({
  questions,
  selectedQuestionId,
  onQuestionSelect,
  submissionAnswers,
  loadingAnswers,
  answersError,
  onRetryAnswers,
  manualGradingQuestions = []
}) => {
  const getAnswerForQuestion = (questionId: number) => {
    return submissionAnswers.find(answer => answer.question_id === questionId);
  };

  const isManualGradingQuestion = (questionId: number) => {
    return manualGradingQuestions.some(q => q.id === questionId);
  };

  // Filter to show only manual grading questions in the main list
  const questionsToShow = questions.filter(question => 
    question.question_type === 'essay_question' || 
    question.question_type === 'fill_in_multiple_blanks_question' ||
    question.question_type === 'file_upload_question' ||
    question.question_type === 'short_answer_question'
  );

  return (
    <Card>
      <QuizQuestionsHeader
        questionsCount={questionsToShow.length}
        loadingAnswers={loadingAnswers}
        answersError={answersError}
      />
      
      <CardContent>
        <QuizQuestionsErrorAlert
          answersError={answersError}
          onRetryAnswers={onRetryAnswers}
        />

        {questionsToShow.length === 0 ? (
          <QuizQuestionsEmptyState />
        ) : (
          <div className="space-y-3">
            {questionsToShow.map((question) => {
              const answer = getAnswerForQuestion(question.id);
              const isSelected = selectedQuestionId === question.id;
              const needsManualGrading = isManualGradingQuestion(question.id);
              
              // Find the original position of this question in the full quiz
              const originalPosition = questions.findIndex(q => q.id === question.id) + 1;
              
              return (
                <QuizQuestionButton
                  key={question.id}
                  question={question}
                  originalPosition={originalPosition}
                  isSelected={isSelected}
                  needsManualGrading={needsManualGrading}
                  answer={answer}
                  answersError={answersError}
                  onClick={() => onQuestionSelect(question.id)}
                />
              );
            })}
          </div>
        )}

        <QuizQuestionsInfoAlerts
          manualGradingQuestions={manualGradingQuestions}
          questionsToShow={questionsToShow}
          totalQuestions={questions.length}
        />
      </CardContent>
    </Card>
  );
};

export default QuizQuestionsList;
