
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, User, Loader2 } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  attempt: number;
  started_at: string | null;
  finished_at: string | null;
  workflow_state: string;
  user: {
    name: string;
    sortable_name: string;
  };
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface QuizSubmissionViewProps {
  submission: QuizSubmission;
  questions: QuizQuestion[];
  selectedQuestionId: number | null;
  onQuestionSelect: (questionId: number) => void;
  submissionAnswers?: SubmissionAnswer[];
  loadingAnswers?: boolean;
  onFetchAnswers: (submissionId: number) => void;
}

const QuizSubmissionView: React.FC<QuizSubmissionViewProps> = ({
  submission,
  questions,
  selectedQuestionId,
  onQuestionSelect,
  submissionAnswers = [],
  loadingAnswers = false,
  onFetchAnswers
}) => {
  // Fetch answers when submission changes
  useEffect(() => {
    if (submission && !submissionAnswers.length && !loadingAnswers) {
      onFetchAnswers(submission.id);
    }
  }, [submission.id, submissionAnswers.length, loadingAnswers, onFetchAnswers]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case 'essay_question':
        return 'Essay';
      case 'fill_in_multiple_blanks_question':
        return 'Fill in the Blanks';
      case 'file_upload_question':
        return 'File Upload';
      default:
        return type.replace('_', ' ');
    }
  };

  const getAnswerForQuestion = (questionId: number) => {
    return submissionAnswers.find(answer => answer.question_id === questionId);
  };

  const renderAnswerContent = (answer: SubmissionAnswer | undefined) => {
    if (!answer || !answer.answer) {
      return <p className="text-gray-500 italic">No answer provided</p>;
    }

    if (Array.isArray(answer.answer)) {
      return (
        <div className="space-y-2">
          {answer.answer.map((item, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              {item}
            </div>
          ))}
        </div>
      );
    }

    // Check if the answer contains HTML
    if (typeof answer.answer === 'string' && answer.answer.includes('<')) {
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: answer.answer }}
        />
      );
    }

    return <p className="whitespace-pre-wrap">{answer.answer}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Submission Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {submission.user.sortable_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Attempt:</span> {submission.attempt}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={submission.workflow_state === 'graded' ? 'default' : 'destructive'}>
                {submission.workflow_state}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Started:</span> {formatDate(submission.started_at)}
            </div>
            <div>
              <span className="font-medium">Finished:</span> {formatDate(submission.finished_at)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Requiring Manual Grading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Questions Requiring Manual Grading ({questions.length})
            {loadingAnswers && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No questions require manual grading for this quiz.
            </p>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => {
                const answer = getAnswerForQuestion(question.id);
                const isSelected = selectedQuestionId === question.id;
                
                return (
                  <Button
                    key={question.id}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start p-4 h-auto"
                    onClick={() => onQuestionSelect(question.id)}
                  >
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeDisplay(question.question_type)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.points_possible} pts
                          </Badge>
                          {answer && (
                            <Badge 
                              variant={answer.answer ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {answer.answer ? "Answered" : "No Answer"}
                            </Badge>
                          )}
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
        </CardContent>
      </Card>

      {/* Selected Question Details with Student Answer */}
      {selectedQuestionId && (
        <Card>
          <CardHeader>
            <CardTitle>Question Details & Student Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
              const answer = getAnswerForQuestion(selectedQuestionId);
              
              if (!selectedQuestion) return null;
              
              return (
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
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {renderAnswerContent(answer)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizSubmissionView;
