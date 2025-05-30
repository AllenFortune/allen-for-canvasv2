
import React from 'react';

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface DebugInfoProps {
  submissionAnswers: SubmissionAnswer[];
  answer: SubmissionAnswer | undefined;
  selectedQuestion: QuizQuestion;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
  submissionAnswers,
  answer,
  selectedQuestion
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <details className="text-xs">
        <summary className="font-medium text-gray-700 cursor-pointer">Debug Info</summary>
        <div className="mt-2 bg-gray-100 p-2 rounded">
          <p>Total answers loaded: {submissionAnswers.length}</p>
          <p>Answer found for this question: {answer ? 'Yes' : 'No'}</p>
          <p>Question type: {selectedQuestion.question_type}</p>
          {answer && (
            <>
              <p>Answer type: {typeof answer.answer}</p>
              <p>Answer correct: {answer.correct?.toString()}</p>
              <p>Answer points: {answer.points}</p>
              <p>Answer preview: {JSON.stringify(answer.answer)?.substring(0, 100)}...</p>
            </>
          )}
        </div>
      </details>
    </div>
  );
};

export default DebugInfo;
