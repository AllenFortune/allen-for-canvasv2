
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { useSubscription } from '@/hooks/useSubscription';
import QuizAIGradingSection from './QuizAIGradingSection';
import AIGradeReview from './AIGradeReview';

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface QuizSubmission {
  id: number;
  user: {
    name: string;
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

interface QuizGradingFormProps {
  submission: QuizSubmission;
  question: QuizQuestion;
  submissionAnswer?: SubmissionAnswer;
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string) => Promise<boolean>;
}

const QuizGradingForm: React.FC<QuizGradingFormProps> = ({
  submission,
  question,
  submissionAnswer,
  gradeQuestion
}) => {
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiGradeReview, setAiGradeReview] = useState('');
  
  // AI Grading state
  const [useRubric, setUseRubric] = useState(true);
  const [isSummativeAssessment, setIsSummativeAssessment] = useState(true);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const { toast } = useToast();
  const { generateComprehensiveFeedback, isGenerating } = useAIFeedback();
  const { incrementUsage } = useSubscription();

  // Reset form when question or submission changes
  useEffect(() => {
    setScore('');
    setComment('');
    setAiGradeReview('');
  }, [question.id, submission.id]);

  const handleAIGrade = async () => {
    if (!submissionAnswer) return;

    // Check usage limit before proceeding
    const canProceed = await incrementUsage();
    if (!canProceed) {
      return; // incrementUsage will show appropriate error message
    }

    try {
      // Create a mock assignment object for the AI grading
      const mockAssignment = {
        id: question.id,
        name: question.question_name || `Question ${question.id}`,
        description: question.question_text,
        due_at: null,
        points_possible: question.points_possible,
        course_id: null,
        html_url: '',
        submission_types: ['online_quiz'],
        rubric: null
      };

      // Create a mock submission object with all required properties
      const mockSubmission = {
        id: submission.id,
        user_id: typeof submission.user?.name === 'string' ? parseInt(submission.user.name) || 1 : 1,
        assignment_id: question.id,
        submitted_at: new Date().toISOString(),
        graded_at: null,
        grade: null,
        score: null,
        submission_comments: [],
        body: typeof submissionAnswer.answer === 'string' 
          ? submissionAnswer.answer 
          : JSON.stringify(submissionAnswer.answer),
        url: null,
        attachments: [],
        submission_type: 'online_quiz',
        workflow_state: 'submitted',
        late: false,
        missing: false,
        user: {
          id: typeof submission.user?.name === 'string' ? parseInt(submission.user.name) || 1 : 1,
          name: submission.user?.name || 'Unknown Student',
          email: '',
          avatar_url: null,
          sortable_name: submission.user?.sortable_name || 'Unknown Student'
        }
      };

      const result = await generateComprehensiveFeedback(
        mockSubmission,
        mockAssignment,
        score || undefined,
        useRubric,
        isSummativeAssessment,
        useCustomPrompt ? customPrompt : undefined,
        true, // isQuizQuestion
        question.question_type,
        question.question_text
      );

      if (result) {
        if (result.grade !== null && result.grade !== undefined) {
          setScore(result.grade.toString());
        }
        setComment(result.feedback || 'AI feedback could not be generated. Please try again.');
        setAiGradeReview(result.gradeReview || '');
        
        toast({
          title: "AI Grading Complete",
          description: "AI has provided suggested grade and feedback for this question.",
        });
      }
    } catch (error) {
      console.error('Error with AI grading:', error);
      toast({
        title: "AI Grading Failed",
        description: "Failed to generate AI grade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await gradeQuestion(submission.id, question.id, score, comment);
      
      if (success) {
        toast({
          title: "Question Graded",
          description: `Successfully graded question for ${submission.user.name}`,
        });
      } else {
        toast({
          title: "Grading Failed",
          description: "Failed to save the grade. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the grade.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
        return type.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg">Grade Question</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {getQuestionTypeDisplay(question.question_type)}
            </Badge>
            <Badge variant="secondary">
              {question.points_possible} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Student</Label>
            <p className="text-sm text-gray-600">{submission.user.sortable_name}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Question</Label>
            <p className="text-sm text-gray-600 line-clamp-3">
              {question.question_name || `Question ${question.id}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Score (out of {question.points_possible})</Label>
            <Input
              id="score"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
              min="0"
              max={question.points_possible}
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Feedback (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter feedback for the student..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving || !score}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Grade
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <QuizAIGradingSection
        question={question}
        submissionAnswer={submissionAnswer}
        onAIGrade={handleAIGrade}
        isGenerating={isGenerating}
        useRubric={useRubric}
        setUseRubric={setUseRubric}
        isSummativeAssessment={isSummativeAssessment}
        setIsSummativeAssessment={setIsSummativeAssessment}
        useCustomPrompt={useCustomPrompt}
        setUseCustomPrompt={setUseCustomPrompt}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
      />

      <AIGradeReview 
        gradeReview={aiGradeReview}
        isVisible={!!aiGradeReview}
      />
    </div>
  );
};

export default QuizGradingForm;
