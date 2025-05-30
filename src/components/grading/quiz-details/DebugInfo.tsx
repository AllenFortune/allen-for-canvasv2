
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

  const answersWithContent = submissionAnswers.filter(a => 
    a.answer !== null && 
    a.answer !== undefined && 
    a.answer !== '' &&
    (typeof a.answer !== 'string' || a.answer.trim() !== '')
  );

  return (
    <div className="border-t pt-4">
      <details className="text-xs">
        <summary className="font-medium text-gray-700 cursor-pointer">Debug Info - Canvas Answer Data</summary>
        <div className="mt-2 bg-gray-100 p-2 rounded space-y-2">
          <p><strong>Total answers loaded:</strong> {submissionAnswers.length}</p>
          <p><strong>Answers with content:</strong> {answersWithContent.length}</p>
          <p><strong>Answer found for this question:</strong> {answer ? 'Yes' : 'No'}</p>
          <p><strong>Question type:</strong> {selectedQuestion.question_type}</p>
          
          {answer && (
            <div className="border-t pt-2">
              <p><strong>Current Question Answer:</strong></p>
              <p>Answer type: {typeof answer.answer}</p>
              <p>Answer correct: {answer.correct?.toString()}</p>
              <p>Answer points: {answer.points}</p>
              <p>Answer content length: {
                answer.answer ? 
                  (typeof answer.answer === 'string' ? answer.answer.length : JSON.stringify(answer.answer).length) 
                  : 0
              }</p>
              <div className="bg-white p-1 rounded mt-1">
                <strong>Raw answer data:</strong>
                <pre className="text-xs overflow-auto max-h-20">
                  {JSON.stringify(answer.answer, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="border-t pt-2">
            <p><strong>All Answers Summary:</strong></p>
            <div className="bg-white p-1 rounded max-h-32 overflow-auto">
              {submissionAnswers.map((ans, idx) => (
                <div key={ans.id} className="text-xs border-b py-1">
                  <strong>Q{idx + 1} (ID: {ans.question_id}):</strong> 
                  {ans.answer ? 
                    ` Has content (${typeof ans.answer}, ${
                      typeof ans.answer === 'string' ? ans.answer.length : 'object'
                    } chars)` : 
                    ' No answer'
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default DebugInfo;
