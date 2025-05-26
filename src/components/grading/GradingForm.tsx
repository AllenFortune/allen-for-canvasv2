
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from 'lucide-react';

interface Assignment {
  points_possible: number | null;
}

interface GradingFormProps {
  assignment: Assignment | null;
  gradeInput: string;
  setGradeInput: (value: string) => void;
  commentInput: string;
  setCommentInput: (value: string) => void;
  onSaveGrade: () => void;
  saving: boolean;
}

const GradingForm: React.FC<GradingFormProps> = ({
  assignment,
  gradeInput,
  setGradeInput,
  commentInput,
  setCommentInput,
  onSaveGrade,
  saving
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Grade & Feedback</CardTitle>
          <Button variant="outline" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI-Assist
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Grade (out of {assignment?.points_possible || 'N/A'})
          </label>
          <Input
            type="number"
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
            placeholder="Enter grade"
            max={assignment?.points_possible || undefined}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Comments</label>
          <Textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Enter feedback for the student..."
            rows={4}
          />
        </div>
        <Button 
          onClick={onSaveGrade}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Grade'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GradingForm;
