
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuizSubmissionSummary } from '@/hooks/useQuizSubmissionsData';

interface QuizGradingStatusBadgeProps {
  submissionData?: QuizSubmissionSummary;
  hasManualGradingQuestions?: boolean;
}

const QuizGradingStatusBadge: React.FC<QuizGradingStatusBadgeProps> = ({ submissionData, hasManualGradingQuestions = true }) => {
  if (!submissionData) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (submissionData.loading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (submissionData.error) {
    return (
      <Badge variant="outline" className="text-gray-500">
        Error
      </Badge>
    );
  }

  const { totalSubmissions, needsGrading, graded } = submissionData;

  if (totalSubmissions === 0) {
    return (
      <Badge variant="secondary" className="text-gray-600">
        No submissions
      </Badge>
    );
  }

  // If no manual grading questions, show auto-graded status
  if (!hasManualGradingQuestions) {
    return (
      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
        Auto-graded
      </Badge>
    );
  }

  if (needsGrading > 0) {
    return (
      <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
        {needsGrading} need grading
      </Badge>
    );
  }

  if (graded === totalSubmissions) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        All graded
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-blue-600">
      {graded}/{totalSubmissions} graded
    </Badge>
  );
};

export default QuizGradingStatusBadge;
