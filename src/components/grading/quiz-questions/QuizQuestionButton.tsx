
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { getQuestionTypeDisplay } from '../utils/quizSubmissionUtils';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizQuestionButtonProps {
  question: QuizQuestion;
  originalPosition: number;
  isSelected: boolean;
  needsManualGrading: boolean;
  status: string | null;
  onQuestionSelect: (questionId: number) => void;
}

const QuizQuestionButton: React.FC<QuizQuestionButtonProps> = ({
  question,
  originalPosition,
  isSelected,
  needsManualGrading,
  status,
  onQuestionSelect
}) => {
  const getButtonStyling = () => {
    if (isSelected && needsManualGrading) {
      return "w-full justify-start p-4 h-auto border-l-4 border-l-orange-400 bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 text-gray-900";
    } else if (needsManualGrading) {
      return "w-full justify-start p-4 h-auto border-l-4 border-l-orange-400";
    } else {
      return "w-full justify-start p-4 h-auto";
    }
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
    <Button
      variant={isSelected && !needsManualGrading ? "default" : "outline"}
      className={getButtonStyling()}
      onClick={() => onQuestionSelect(question.id)}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">
            Question {originalPosition}
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
};

export default QuizQuestionButton;
