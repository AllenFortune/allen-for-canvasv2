
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { isContentEffectivelyEmpty } from '../utils/quizSubmissionUtils';

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
  question_type?: string;
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

  const cleanHtmlContent = (htmlString: string) => {
    // Remove HTML tags but preserve line breaks and basic formatting
    return htmlString
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  };

  const renderMatchingAnswer = (matchingData: any) => {
    console.log('Rendering matching answer:', matchingData);
    
    if (Array.isArray(matchingData)) {
      return (
        <div className="space-y-2">
          {matchingData.map((match: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
              <span className="font-medium text-sm">Match {index + 1}:</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span>{match.answer_text || match.text || 'No match selected'}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof matchingData === 'object' && matchingData !== null) {
      const entries = Object.entries(matchingData);
      return (
        <div className="space-y-2">
          {entries.map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
              <span className="font-medium text-sm">{key}:</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span className="text-gray-500">Invalid matching format</span>;
  };

  const renderFillInBlanksAnswer = (blanksData: any) => {
    console.log('Rendering fill-in-blanks answer:', blanksData);
    
    if (Array.isArray(blanksData)) {
      return (
        <div className="space-y-2">
          {blanksData.map((blank: any, index: number) => (
            <div key={index} className="p-2 bg-white rounded border">
              <strong>Blank {blank.blank_id || (index + 1)}:</strong> {blank.answer_text || 'No answer'}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof blanksData === 'object' && blanksData !== null) {
      const entries = Object.entries(blanksData);
      return (
        <div className="space-y-2">
          {entries.map(([blankId, blankAnswer], index) => (
            <div key={index} className="p-2 bg-white rounded border">
              <strong>Blank {blankId}:</strong> {typeof blankAnswer === 'string' ? blankAnswer : JSON.stringify(blankAnswer)}
            </div>
          ))}
        </div>
      );
    }
    
    return <span className="text-gray-500">Invalid fill-in-blanks format</span>;
  };

  if (!answer || isContentEffectivelyEmpty(answer.answer)) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
        <p className="text-gray-500 italic">No answer provided</p>
      </div>
    );
  }

  // Handle different question types specifically
  if (questionType === 'matching_question' && answer.answer) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-sm mb-2">Matching Pairs:</h5>
        {renderMatchingAnswer(answer.answer)}
        {renderCorrectnessBadge()}
      </div>
    );
  }

  if (questionType === 'fill_in_multiple_blanks_question' && answer.answer) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-sm mb-2">Fill-in-the-Blanks:</h5>
        {renderFillInBlanksAnswer(answer.answer)}
        {renderCorrectnessBadge()}
      </div>
    );
  }

  // Handle array answers (for multiple answer questions)
  if (Array.isArray(answer.answer)) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-sm mb-2">Selected Answers:</h5>
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

  // Handle object answers (complex question types)
  if (typeof answer.answer === 'object' && answer.answer !== null) {
    const answerObj = answer.answer as any;
    
    let contentToRender = null;
    
    if (answerObj.text) {
      const isHtml = answerObj.text.includes('<');
      contentToRender = isHtml ? 
        <div className="whitespace-pre-wrap">{cleanHtmlContent(answerObj.text)}</div> :
        <div className="whitespace-pre-wrap">{answerObj.text}</div>;
    } else if (answerObj.answer_text) {
      const isHtml = answerObj.answer_text.includes('<');
      contentToRender = isHtml ? 
        <div className="whitespace-pre-wrap">{cleanHtmlContent(answerObj.answer_text)}</div> :
        <div className="whitespace-pre-wrap">{answerObj.answer_text}</div>;
    } else if (answerObj.answers && Array.isArray(answerObj.answers)) {
      contentToRender = (
        <div className="space-y-2">
          {answerObj.answers.map((item: any, index: number) => (
            <div key={index} className="p-2 bg-white rounded border">
              <strong>Item {index + 1}:</strong> {item.text || item.answer_text || item.answer || 'No answer'}
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

  // Handle string answers (most common case)
  if (typeof answer.answer === 'string') {
    const isHtml = answer.answer.includes('<');
    
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        {isHtml ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {cleanHtmlContent(answer.answer)}
          </div>
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
