
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuizStudentInfo from './QuizStudentInfo';
import QuizGradeInputs from './QuizGradeInputs';

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

interface QuizGradingCardProps {
  submission: QuizSubmission;
  question: QuizQuestion;
  score: string;
  setScore: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  children: React.ReactNode;
}

const QuizGradingCard: React.FC<QuizGradingCardProps> = ({
  submission,
  question,
  score,
  setScore,
  comment,
  setComment,
  children
}) => {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Grade Question</CardTitle>
        <QuizStudentInfo submission={submission} question={question} />
      </CardHeader>
      <CardContent className="space-y-4">
        <QuizGradeInputs
          score={score}
          setScore={setScore}
          comment={comment}
          setComment={setComment}
          pointsPossible={question.points_possible}
        />
        {children}
      </CardContent>
    </Card>
  );
};

export default QuizGradingCard;
