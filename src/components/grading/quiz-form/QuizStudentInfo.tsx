
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  user: {
    name: string;
    sortable_name: string;
  };
}

interface QuizStudentInfoProps {
  submission: QuizSubmission;
  question: QuizQuestion;
}

const QuizStudentInfo: React.FC<QuizStudentInfoProps> = ({
  submission,
  question
}) => {
  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case 'essay_question':
        return 'Essay';
      case 'short_answer_question':
        return 'Short Answer';
      case 'fill_in_multiple_blanks_question':
        return 'Fill in the Blanks';
      case 'file_upload_question':
        return 'File Upload';
      case 'numerical_question':
        return 'Numerical';
      case 'text_only_question':
        return 'Text Only';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {getQuestionTypeDisplay(question.question_type)}
        </Badge>
        <Badge variant="secondary">
          {question.points_possible} pts
        </Badge>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Student</Label>
        <p className="text-sm text-gray-600">{submission.user.sortable_name}</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Question</Label>
        <p className="text-sm text-gray-600 line-clamp-3">
          {question.question_name || `Question ${question.id}`}
        </p>
      </div>
    </>
  );
};

export default QuizStudentInfo;
