
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { isContentEffectivelyEmpty } from '../utils/quizSubmissionUtils';

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface AnswerContentRendererProps {
  answer: SubmissionAnswer | undefined;
  questionType: string;
}

const AnswerContentRenderer: React.FC<AnswerContentRendererProps> = ({
  answer,
  questionType
}) => {
  const showCorrectness = questionType !== 'essay_question' && 
                         questionType !== 'fill_in_multiple_blanks_question' &&
                         questionType !== 'file_upload_question';

  const renderCorrectnessBadge = () => {
    if (!showCorrectness || answer?.correct === null) return null;
    
    return (
      <div className="mt-2 flex items-center gap-2">
        {answer.correct ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Correct
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Incorrect
          </Badge>
        )}
        {answer.points !== null && (
          <Badge variant="secondary">{answer.points} points</Badge>
        )}
      </div>
    );
  };

  if (!answer || isContentEffectivelyEmpty(answer.answer)) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
        <p className="text-gray-500 italic">No answer provided</p>
      </div>
    );
  }

  // Handle array answers
  if (Array.isArray(answer.answer)) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          {answer.answer.map((item, index) => (
            <div key={index} className="p-2 bg-white rounded border">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </div>
          ))}
        </div>
        {renderCorrectnessBadge()}
      </div>
    );
  }

  // Handle object answers
  if (typeof answer.answer === 'object' && answer.answer !== null) {
    const answerObj = answer.answer as any;
    
    let contentToRender = null;
    
    if (answerObj.text) {
      contentToRender = <div className="whitespace-pre-wrap">{answerObj.text}</div>;
    } else if (answerObj.answer_text) {
      contentToRender = <div className="whitespace-pre-wrap">{answerObj.answer_text}</div>;
    } else if (answerObj.answers && Array.isArray(answerObj.answers)) {
      contentToRender = (
        <div className="space-y-2">
          {answerObj.answers.map((item: any, index: number) => (
            <div key={index} className="p-2 bg-white rounded border">
              <strong>Blank {index + 1}:</strong> {item.text || item.answer_text || 'No answer'}
            </div>
          ))}
        </div>
      );
    } else {
      contentToRender = (
        <div className="p-2 bg-white rounded border">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(answerObj, null, 2)}
          </pre>
        </div>
      );
    }
    
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        {contentToRender}
        {renderCorrectnessBadge()}
      </div>
    );
  }

  // Handle string answers
  if (typeof answer.answer === 'string') {
    const isHtml = answer.answer.includes('<');
    
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        {isHtml ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: answer.answer }}
          />
        ) : (
          <p className="whitespace-pre-wrap">{answer.answer}</p>
        )}
        {renderCorrectnessBadge()}
      </div>
    );
  }

  return (
    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-l-red-300">
      <p className="text-red-600 italic">Invalid answer format detected</p>
      <pre className="text-xs mt-1 text-red-500">
        Type: {typeof answer.answer}, Value: {JSON.stringify(answer.answer)}
      </pre>
    </div>
  );
};

export default AnswerContentRenderer;
