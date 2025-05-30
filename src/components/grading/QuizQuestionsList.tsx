
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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

  const getAnswerStatus = (question: QuizQuestion, answer: SubmissionAnswer | undefined) => {
    if (answersError) return null;
    
    const hasAnswer = !isContentEffectivelyEmpty(answer?.answer);
    const needsManualGrading = isManualGradingQuestion(question.id);
    
    if (needsManualGrading) {
      return hasAnswer ? "essay-answered" : "essay-no-answer";
    }
    
    if (answer?.correct === true) return "correct";
    if (answer?.correct === false) return "incorrect";
    if (hasAnswer) return "answered";
    return "no-answer";
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case "correct":
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Correct</Badge>;
      case "incorrect":
        return <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />Incorrect</Badge>;
      case "essay-answered":
        return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Answered</Badge>;
      case "essay-no-answer":
        return <Badge variant="destructive" className="text-xs"><FileText className="w-3 h-3 mr-1" />No Answer</Badge>;
      case "answered":
        return <Badge variant="secondary" className="text-xs">Answered</Badge>;
      case "no-answer":
        return <Badge variant="outline" className="text-xs">No Answer</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          All Quiz Questions ({questions.length})
          {loadingAnswers && <Loader2 className="w-4 h-4 animate-spin" />}
          {answersError && <AlertCircle className="w-4 h-4 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {answersError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Failed to load student answers</p>
                <p className="text-xs text-red-600">{answersError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryAnswers}
                className="text-red-700 border-red-300"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {questions.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No questions found for this quiz.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => {
              const answer = getAnswerForQuestion(question.id);
              const isSelected = selectedQuestionId === question.id;
              const needsManualGrading = isManualGradingQuestion(question.id);
              const status = getAnswerStatus(question, answer);
              
              return (
                <Button
                  key={question.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start p-4 h-auto ${
                    needsManualGrading ? 'border-l-4 border-l-orange-400' : ''
                  }`}
                  onClick={() => onQuestionSelect(question.id)}
                >
                  <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        Question {index + 1}
                        {needsManualGrading && <span className="ml-1 text-orange-600">*</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getQuestionTypeDisplay(question.question_type)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.points_possible} pts
                        </Badge>
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    <div 
                      className="text-sm text-left text-gray-600 line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: question.question_name || question.question_text 
                      }}
                    />
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {manualGradingQuestions.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <span className="text-orange-600">*</span> Questions marked with an asterisk require manual grading
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestionsList;
