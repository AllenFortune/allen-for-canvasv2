
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { getQuestionTypeDisplay, isContentEffectivelyEmpty } from './utils/quizSubmissionUtils';

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

  const renderAnswerContent = (answer: SubmissionAnswer | undefined, questionType: string) => {
    console.log('Rendering answer content for:', {
      answer,
      questionType,
      hasAnswer: !!answer,
      answerValue: answer?.answer,
      answerType: typeof answer?.answer,
      isEmpty: isContentEffectivelyEmpty(answer?.answer)
    });

    if (!answer || isContentEffectivelyEmpty(answer.answer)) {
      return (
        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
          <p className="text-gray-500 italic">No answer provided</p>
        </div>
      );
    }

    // For multiple choice and other auto-graded questions, show correctness
    const showCorrectness = questionType !== 'essay_question' && 
                           questionType !== 'fill_in_multiple_blanks_question' &&
                           questionType !== 'file_upload_question';

    // Handle different answer formats
    if (Array.isArray(answer.answer)) {
      return (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            {answer.answer.map((item, index) => (
              <div key={index} className="p-2 bg-white rounded border">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </div>
            ))}
          </div>
          {showCorrectness && answer.correct !== null && (
            <div className="mt-2 flex items-center gap-2">
              {answer.correct ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </Badge>
              )}
              {answer.points !== null && (
                <Badge variant="secondary">{answer.points} points</Badge>
              )}
            </div>
          )}
        </div>
      );
    }

    // Handle object answers (common in Canvas for complex question types)
    if (typeof answer.answer === 'object' && answer.answer !== null) {
      const answerObj = answer.answer as any;
      
      let contentToRender = null;
      
      if (answerObj.text) {
        contentToRender = <div className="whitespace-pre-wrap">{answerObj.text}</div>;
      } else if (answerObj.answer_text) {
        contentToRender = <div className="whitespace-pre-wrap">{answerObj.answer_text}</div>;
      } else if (answerObj.answers && Array.isArray(answerObj.answers)) {
        // For fill-in-the-blank questions
        contentToRender = (
          <div className="space-y-2">
            {answerObj.answers.map((item: any, index: number) => (
              <div key={index} className="p-2 bg-white rounded border">
                <strong>Blank {index + 1}:</strong> {item.text || item.answer_text || 'No answer'}
              </div>
            ))}
          </div>
        );
      } else {
        // Fallback: display the object as formatted JSON
        contentToRender = (
          <div className="p-2 bg-white rounded border">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(answerObj, null, 2)}
            </pre>
          </div>
        );
      }
      
      return (
        <div className="p-3 bg-gray-50 rounded-lg">
          {contentToRender}
          {showCorrectness && answer.correct !== null && (
            <div className="mt-2 flex items-center gap-2">
              {answer.correct ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </Badge>
              )}
              {answer.points !== null && (
                <Badge variant="secondary">{answer.points} points</Badge>
              )}
            </div>
          )}
        </div>
      );
    }

    // If it's a string and not effectively empty, render as HTML or plain text
    if (typeof answer.answer === 'string') {
      const isHtml = answer.answer.includes('<');
      
      return (
        <div className="p-3 bg-gray-50 rounded-lg">
          {isHtml ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: answer.answer }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{answer.answer}</p>
          )}
          {showCorrectness && answer.correct !== null && (
            <div className="mt-2 flex items-center gap-2">
              {answer.correct ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </Badge>
              )}
              {answer.points !== null && (
                <Badge variant="secondary">{answer.points} points</Badge>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-l-red-300">
        <p className="text-red-600 italic">Invalid answer format detected</p>
        <pre className="text-xs mt-1 text-red-500">
          Type: {typeof answer.answer}, Value: {JSON.stringify(answer.answer)}
        </pre>
      </div>
    );
  };

  if (!selectedQuestionId) {
    return null;
  }

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const answer = getAnswerForQuestion(selectedQuestionId);
  
  if (!selectedQuestion) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Details & Student Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Question Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {getQuestionTypeDisplay(selectedQuestion.question_type)}
              </Badge>
              <Badge variant="secondary">
                {selectedQuestion.points_possible} points
              </Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Question:</h4>
              <div 
                className="prose prose-sm max-w-none p-3 bg-blue-50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: selectedQuestion.question_text }}
              />
            </div>
          </div>

          {/* Debug Info - Show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4">
              <details className="text-xs">
                <summary className="font-medium text-gray-700 cursor-pointer">Debug Info</summary>
                <div className="mt-2 bg-gray-100 p-2 rounded">
                  <p>Total answers loaded: {submissionAnswers.length}</p>
                  <p>Answer found for this question: {answer ? 'Yes' : 'No'}</p>
                  <p>Question type: {selectedQuestion.question_type}</p>
                  {answer && (
                    <>
                      <p>Answer type: {typeof answer.answer}</p>
                      <p>Answer correct: {answer.correct?.toString()}</p>
                      <p>Answer points: {answer.points}</p>
                      <p>Answer preview: {JSON.stringify(answer.answer)?.substring(0, 100)}...</p>
                    </>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Student Answer */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Student Answer:</h4>
            {loadingAnswers ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : answersError ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Unable to load student answer. You can still grade this question based on other information available.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryAnswers}
                  className="mt-2 text-yellow-700 border-yellow-300"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </Button>
              </div>
            ) : (
              renderAnswerContent(answer, selectedQuestion.question_type)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestionDetails;
