
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getQuestionTypeDisplay } from '../utils/quizSubmissionUtils';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuestionDisplayProps {
  question: QuizQuestion;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {getQuestionTypeDisplay(question.question_type)}
        </Badge>
        <Badge variant="secondary">
          {question.points_possible} points
        </Badge>
      </div>
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Question:</h4>
        <div 
          className="prose prose-sm max-w-none p-3 bg-blue-50 rounded-lg"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      </div>
    </div>
  );
};

export default QuestionDisplay;
