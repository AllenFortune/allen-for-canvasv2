
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
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

  const renderAnswerContent = (answer: SubmissionAnswer | undefined) => {
    // Check if the answer object exists and if its content is effectively empty
    if (!answer || isContentEffectivelyEmpty(answer.answer)) {
      return <p className="text-gray-500 italic">No answer provided</p>;
    }

    // Handle different answer formats
    if (Array.isArray(answer.answer)) {
      return (
        <div className="space-y-2">
          {answer.answer.map((item, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </div>
          ))}
        </div>
      );
    }

    // Handle object answers (common in Canvas for complex question types)
    if (typeof answer.answer === 'object' && answer.answer !== null) {
      // Try to extract meaningful content from object answers
      const answerObj = answer.answer as any;
      
      if (answerObj.text) {
        return <div className="whitespace-pre-wrap">{answerObj.text}</div>;
      }
      
      if (answerObj.answer_text) {
        return <div className="whitespace-pre-wrap">{answerObj.answer_text}</div>;
      }
      
      // For fill-in-the-blank questions
      if (answerObj.answers && Array.isArray(answerObj.answers)) {
        return (
          <div className="space-y-2">
            {answerObj.answers.map((item: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <strong>Blank {index + 1}:</strong> {item.text || item.answer_text || 'No answer'}
              </div>
            ))}
          </div>
        );
      }
      
      // Fallback: display the object as formatted JSON
      return (
        <div className="p-2 bg-gray-50 rounded">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(answerObj, null, 2)}
          </pre>
        </div>
      );
    }

    // If it's a string and not effectively empty, render as HTML or plain text
    if (typeof answer.answer === 'string') {
      // Check if the answer contains HTML (simple check for '<' character)
      if (answer.answer.includes('<')) {
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: answer.answer }}
          />
        );
      }
      return <p className="whitespace-pre-wrap">{answer.answer}</p>;
    }

    return <p className="text-gray-500 italic">Invalid answer format</p>;
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
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedQuestion.question_text }}
              />
            </div>
          </div>

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
              <div className="p-3 bg-gray-50 rounded-lg">
                {renderAnswerContent(answer)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestionDetails;
