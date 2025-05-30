
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface QuizGradingFormProps {
  submission: QuizSubmission;
  question: QuizQuestion;
  gradeQuestion: (submissionId: number, questionId: number, score: string, comment: string) => Promise<boolean>;
}

const QuizGradingForm: React.FC<QuizGradingFormProps> = ({
  submission,
  question,
  gradeQuestion
}) => {
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Reset form when question or submission changes
  useEffect(() => {
    setScore('');
    setComment('');
  }, [question.id, submission.id]);

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
      case 'fill_in_multiple_blanks_question':
        return 'Fill in the Blanks';
      case 'file_upload_question':
        return 'File Upload';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
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
  );
};

export default QuizGradingForm;
