
import React from 'react';
import { FileText } from 'lucide-react';
import { Submission } from '@/types/grading';

interface SubmissionIndicatorProps {
  currentSubmission?: Submission;
}

const SubmissionIndicator: React.FC<SubmissionIndicatorProps> = ({
  currentSubmission
}) => {
  const hasFiles = currentSubmission?.attachments && currentSubmission.attachments.length > 0;

  if (!hasFiles) return null;

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 text-sm text-blue-800">
        <FileText className="w-4 h-4" />
        <span className="font-medium">File Submission Detected</span>
      </div>
      <p className="text-xs text-blue-600 mt-1">
        AI will process and analyze file content for grading
      </p>
    </div>
  );
};

export default SubmissionIndicator;
