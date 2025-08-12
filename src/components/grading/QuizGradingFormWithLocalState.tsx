import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuizAIFeedback } from '@/hooks/useQuizAIFeedback';
import { useSubscription } from '@/hooks/useSubscription';
import AssessmentTypeToggle from './AssessmentTypeToggle';
import CustomPromptToggle from './CustomPromptToggle';
import AIGradeReview from './AIGradeReview';
import ActionButtons from './ActionButtons';
import VoiceControls from '@/components/VoiceControls';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  user_id: number;
  attempt: number;
  score: number | null;
  kept_score: number | null;
  workflow_state: string;
  user: {
    id: number;
    name: string;
    email: string;
    sortable_name: string;
  };
}

interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}

interface QuizGradingFormWithLocalStateProps {
  submission: QuizSubmission;
  question: QuizQuestion;
  submissionAnswer?: SubmissionAnswer;
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string, userId: number) => Promise<boolean>;
  onGradeUpdate?: (submissionId: number, score: string, questionId: number) => void;
  locallyGraded?: boolean;
}

const QuizGradingFormWithLocalState: React.FC<QuizGradingFormWithLocalStateProps> = ({
  submission,
  question,
  submissionAnswer,
  gradeQuestion,
  onGradeUpdate,
  locallyGraded = false
}) => {
  const [score, setScore] = useState(submissionAnswer?.points?.toString() || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummativeAssessment, setIsSummativeAssessment] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiGradeReview, setAiGradeReview] = useState('');
  const [isGradedLocally, setIsGradedLocally] = useState(false);
  
  const { toast } = useToast();
  const { generateQuizFeedback, isGenerating } = useQuizAIFeedback();
  const { incrementUsage } = useSubscription();

  // Reset local grading state when question or submission changes
  useEffect(() => {
    setIsGradedLocally(false);
    setScore(submissionAnswer?.points?.toString() || '');
  }, [question.id, submission.id, submissionAnswer?.points]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!score) {
      toast({
        title: "Score Required",
        description: "Please enter a score for this question.",
        variant: "destructive",
      });
      return;
    }

    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > question.points_possible) {
      toast({
        title: "Invalid Score",
        description: `Score must be between 0 and ${question.points_possible}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await gradeQuestion(submission.id, question.id, score, comment, submission.user_id);
      
      if (success) {
        toast({
          title: "Question Graded",
          description: `Successfully graded question for ${submission.user.name}`,
        });

        // Mark as graded locally to show updated score
        setIsGradedLocally(true);

        // Update parent component with new grade and question ID
        if (onGradeUpdate) {
          onGradeUpdate(submission.id, score, question.id);
        }
      } else {
        toast({
          title: "Grading Failed",
          description: "Failed to submit grade. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error grading question:', error);
      toast({
        title: "Error",
        description: "An error occurred while grading.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradingStatus = () => {
    if (locallyGraded || isGradedLocally) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Graded (Local)
        </Badge>
      );
    }
    
    if (submissionAnswer?.points !== null && submissionAnswer?.points !== undefined) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Graded
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Needs Grading
      </Badge>
    );
  };

  const handleAIGrading = async () => {
    if (!submissionAnswer || !question) return;

    // Check usage limit before proceeding
    const canProceed = await incrementUsage();
    if (!canProceed) {
      return; // incrementUsage will show appropriate error message
    }

    const aiResult = await generateQuizFeedback(
      question,
      submissionAnswer,
      score,
      isSummativeAssessment,
      useCustomPrompt ? customPrompt : undefined
    );

    if (aiResult) {
      if (aiResult.grade !== null && aiResult.grade !== undefined) {
        setScore(aiResult.grade.toString());
      }
      setComment(aiResult.feedback || 'AI feedback could not be generated. Please try again.');
      setAiGradeReview(aiResult.gradeReview || '');
    }
  };

  // Voice controls context
  const voiceContext = {
    setGradeInput: setScore,
    setCommentInput: setComment,
    onSaveGrade: () => handleSubmit(new Event('submit') as any),
    onAIGrading: handleAIGrading,
    setUseRubricForAI: () => {}, // Not applicable for quiz
    setIsSummativeAssessment,
    setUseCustomPrompt,
    setCustomPrompt,
    gradeInput: score,
    commentInput: comment,
    useRubricForAI: false,
    isSummativeAssessment,
    useCustomPrompt,
    customPrompt
  };

  // Check if this question type supports AI grading
  const supportsAIGrading = submissionAnswer && ['essay_question', 'short_answer_question', 'text_only_question'].includes(question.question_type);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Grade Question</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getGradingStatus()}
            <VoiceControls context={voiceContext} />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Student: {submission.user.name} • Points Possible: {question.points_possible}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max={question.points_possible}
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0"
              className="w-full"
            />
            <div className="text-xs text-gray-500">
              Maximum: {question.points_possible} points
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Feedback (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add feedback for the student..."
              rows={3}
              className="w-full"
            />
          </div>

        </form>

        <AIGradeReview 
          gradeReview={aiGradeReview}
          isVisible={!!aiGradeReview}
        />

        {supportsAIGrading && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <AssessmentTypeToggle
              isSummativeAssessment={isSummativeAssessment}
              setIsSummativeAssessment={setIsSummativeAssessment}
            />
            
            <CustomPromptToggle
              useCustomPrompt={useCustomPrompt}
              setUseCustomPrompt={setUseCustomPrompt}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {supportsAIGrading && (
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={handleAIGrading}
              disabled={isGenerating || !submissionAnswer}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Generating {isSummativeAssessment ? 'Summative' : 'Formative'} Feedback...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  AI-Assisted Grading
                </>
              )}
            </Button>
          )}

          <Button 
            onClick={() => handleSubmit(new Event('submit') as any)}
            disabled={isSubmitting || !score}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isSubmitting ? 'Submitting Grade...' : 'Submit Grade'}
          </Button>
        </div>

        {(isGradedLocally || (submissionAnswer?.points !== null && submissionAnswer?.points !== undefined)) && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">
                Current Grade: {isGradedLocally ? score : submissionAnswer?.points} points
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizGradingFormWithLocalState;