
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HorizontalStudentNavProps {
  submissions: Submission[];
  currentSubmissionIndex: number;
  onSubmissionChange: (index: number) => void;
  assignment: Assignment | null;
}

const HorizontalStudentNav: React.FC<HorizontalStudentNavProps> = ({
  submissions,
  currentSubmissionIndex,
  onSubmissionChange,
  assignment
}) => {
  const currentSubmission = submissions[currentSubmissionIndex];
  
  const getSubmissionStatusColor = (submission: Submission) => {
    if (submission.workflow_state === 'graded') return 'bg-green-500';
    if (submission.late) return 'bg-yellow-500';
    if (submission.submitted_at) return 'bg-blue-500';
    return 'bg-gray-400';
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
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-4">
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
          
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentSubmission.user.avatar_url || undefined} />
              <AvatarFallback>
                {currentSubmission.user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{currentSubmission.user.name}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getSubmissionStatusColor(currentSubmission)}`} />
                <span className="text-xs text-gray-500">
                  {currentSubmission.workflow_state === 'graded' ? 'Graded' : 
                   currentSubmission.submitted_at ? 'Submitted' : 'Not Submitted'}
                </span>
              </div>
            </div>
          </div>

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

        {/* Center: Progress Indicator */}
        <div className="text-sm text-gray-600">
          Student {currentSubmissionIndex + 1} of {submissions.length}
        </div>

        {/* Right: Quick Student Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jump to Student
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
            {submissions.map((submission, index) => (
              <DropdownMenuItem
                key={submission.id}
                onClick={() => onSubmissionChange(index)}
                className={`flex items-center gap-3 p-3 ${
                  index === currentSubmissionIndex ? 'bg-blue-50' : ''
                }`}
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={submission.user.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {submission.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{submission.user.name}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${getSubmissionStatusColor(submission)}`} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default HorizontalStudentNav;
