
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Brain, Loader2, Sparkles, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizAIGradingSectionProps {
  question: QuizQuestion;
  submissionAnswer: any;
  onAIGrade: () => Promise<void>;
  isGenerating: boolean;
  useRubric: boolean;
  setUseRubric: (value: boolean) => void;
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
}

const QuizAIGradingSection: React.FC<QuizAIGradingSectionProps> = ({
  question,
  submissionAnswer,
  onAIGrade,
  isGenerating,
  useRubric,
  setUseRubric,
  isSummativeAssessment,
  setIsSummativeAssessment,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt
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
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const isAIGradable = ['essay_question', 'short_answer_question', 'fill_in_multiple_blanks_question', 'file_upload_question', 'numerical_question', 'text_only_question'].includes(question.question_type);

  const hasAnswer = submissionAnswer && submissionAnswer.answer && 
    submissionAnswer.answer.toString().trim() !== '';

  if (!isAIGradable) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              AI grading is not available for {getQuestionTypeDisplay(question.question_type)} questions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnswer) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              No answer submitted for this question
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">AI Grading Assistant</CardTitle>
          <Badge variant="secondary">
            {getQuestionTypeDisplay(question.question_type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="summative-toggle" className="text-sm font-medium">
            Assessment Type
          </Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="summative-toggle" className="text-xs text-gray-600">
              Formative
            </Label>
            <Switch
              id="summative-toggle"
              checked={isSummativeAssessment}
              onCheckedChange={setIsSummativeAssessment}
            />
            <Label htmlFor="summative-toggle" className="text-xs text-gray-600">
              Summative
            </Label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="rubric-toggle" className="text-sm font-medium">
            Use Question Context for Grading
          </Label>
          <Switch
            id="rubric-toggle"
            checked={useRubric}
            onCheckedChange={setUseRubric}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-prompt-toggle" className="text-sm font-medium">
              Custom Grading Instructions
            </Label>
            <Switch
              id="custom-prompt-toggle"
              checked={useCustomPrompt}
              onCheckedChange={setUseCustomPrompt}
            />
          </div>
          
          {useCustomPrompt && (
            <Textarea
              placeholder="Enter specific instructions for grading this quiz question..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="text-sm"
            />
          )}
        </div>

        <Separator />

        <Button 
          onClick={onAIGrade}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating AI Grade...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Grade & Feedback
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• AI will analyze the student's answer against the question criteria</p>
          <p>• {isSummativeAssessment ? 'Summative' : 'Formative'} assessment guidelines will be applied</p>
          {useRubric && <p>• Question context and expectations will be considered</p>}
          {useCustomPrompt && customPrompt && <p>• Custom grading instructions will be applied</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAIGradingSection;
