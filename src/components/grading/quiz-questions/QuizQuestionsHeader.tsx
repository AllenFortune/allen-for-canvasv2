
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

interface QuizQuestionsHeaderProps {
  questionsCount: number;
  loadingAnswers: boolean;
  answersError: string;
}

const QuizQuestionsHeader: React.FC<QuizQuestionsHeaderProps> = ({
  questionsCount,
  loadingAnswers,
  answersError
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Questions Requiring Manual Grading ({questionsCount})
        {loadingAnswers && <Loader2 className="w-4 h-4 animate-spin" />}
        {answersError && <AlertCircle className="w-4 h-4 text-red-500" />}
      </CardTitle>
    </CardHeader>
  );
};

export default QuizQuestionsHeader;
