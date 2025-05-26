
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackInputProps {
  commentInput: string;
  setCommentInput: (value: string) => void;
}

const FeedbackInput: React.FC<FeedbackInputProps> = ({
  commentInput,
  setCommentInput
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Feedback for Student
      </label>
      <Textarea
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        placeholder="Write feedback for the student or use AI-assisted grading to generate personalized, paragraph-form feedback..."
        rows={8}
        className="resize-none"
      />
    </div>
  );
};

export default FeedbackInput;
