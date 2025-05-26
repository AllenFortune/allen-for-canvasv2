
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';

interface StudentNavigationPanelProps {
  submissions: Submission[];
  currentSubmissionIndex: number;
  onSubmissionChange: (index: number) => void;
  assignment: Assignment | null;
}

const StudentNavigationPanel: React.FC<StudentNavigationPanelProps> = ({
  submissions,
  currentSubmissionIndex,
  onSubmissionChange,
  assignment
}) => {
  const currentSubmission = submissions[currentSubmissionIndex];
  
  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.workflow_state === 'graded') {
      return <Badge className="bg-green-500 text-white">Graded</Badge>;
    } else if (submission.workflow_state === 'unsubmitted' || !submission.submitted_at) {
      return <Badge variant="outline" className="text-gray-500">Not Submitted</Badge>;
    } else if (submission.late) {
      return <Badge className="bg-yellow-500 text-white">Late</Badge>;
    } else if (submission.submitted_at) {
      return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const navigateToPrevious = () => {
    if (currentSubmissionIndex > 0) {
      onSubmissionChange(currentSubmissionIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      onSubmissionChange(currentSubmissionIndex + 1);
    }
  };

  if (!currentSubmission) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Student Navigation</span>
          <span className="text-sm font-normal text-gray-600">
            {currentSubmissionIndex + 1} of {submissions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Student Info */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Avatar>
            <AvatarImage src={currentSubmission.user.avatar_url || undefined} />
            <AvatarFallback>
              {currentSubmission.user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentSubmission.user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {getSubmissionStatusBadge(currentSubmission)}
              {currentSubmission.workflow_state === 'graded' && currentSubmission.score !== null && (
                <span className="text-xs text-gray-500">
                  {currentSubmission.score}/{assignment?.points_possible || '?'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToPrevious}
            disabled={currentSubmissionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToNext}
            disabled={currentSubmissionIndex === submissions.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Student List for Direct Navigation */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
          {submissions.map((submission, index) => (
            <button
              key={submission.id}
              onClick={() => onSubmissionChange(index)}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                index === currentSubmissionIndex 
                  ? 'bg-blue-100 border border-blue-300' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{submission.user.name}</span>
                <div className="flex items-center gap-1">
                  {submission.workflow_state === 'graded' && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                  {submission.submitted_at && submission.workflow_state !== 'graded' && (
                    <span className="text-xs text-blue-600">●</span>
                  )}
                  {!submission.submitted_at && (
                    <span className="text-xs text-gray-400">○</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentNavigationPanel;
