
import React from 'react';
import { FileText } from 'lucide-react';

const QuizQuestionsEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Essay Questions Found</h3>
      <p className="text-gray-600">
        This quiz does not contain any essay questions that require manual grading.
      </p>
    </div>
  );
};

export default QuizQuestionsEmptyState;
