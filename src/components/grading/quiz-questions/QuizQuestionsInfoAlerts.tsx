
import React from 'react';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizQuestionsInfoAlertsProps {
  manualGradingQuestions: QuizQuestion[];
  questionsToShow: QuizQuestion[];
  totalQuestions: number;
}

const QuizQuestionsInfoAlerts: React.FC<QuizQuestionsInfoAlertsProps> = ({
  manualGradingQuestions,
  questionsToShow,
  totalQuestions
}) => {
  return (
    <>
      {questionsToShow.length > 0 && questionsToShow.length < totalQuestions && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing only essay questions that require manual grading. 
            {totalQuestions - questionsToShow.length} other questions are auto-graded and hidden.
          </p>
        </div>
      )}
    </>
  );
};

export default QuizQuestionsInfoAlerts;
