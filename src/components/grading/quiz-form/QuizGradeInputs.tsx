
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface QuizGradeInputsProps {
  score: string;
  setScore: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  pointsPossible: number;
}

const QuizGradeInputs: React.FC<QuizGradeInputsProps> = ({
  score,
  setScore,
  comment,
  setComment,
  pointsPossible
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="score">Score (out of {pointsPossible})</Label>
        <Input
          id="score"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter score"
          min="0"
          max={pointsPossible}
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
    </>
  );
};

export default QuizGradeInputs;
