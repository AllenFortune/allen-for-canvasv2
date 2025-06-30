
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface QuizSubmission {
  id: number;
  user_id: number;
  attempt: number;
  score: number | null;
  kept_score: number | null;
  workflow_state: string;
  started_at: string | null;
  finished_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    sortable_name: string;
  };
}

interface HorizontalQuizStudentNavProps {
  sortedSubmissions: QuizSubmission[];
  selectedSubmissionIndex: number;
  onSubmissionSelect: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const HorizontalQuizStudentNav: React.FC<HorizontalQuizStudentNavProps> = ({
  sortedSubmissions,
  selectedSubmissionIndex,
  onSubmissionSelect,
  onNavigate
}) => {
  const selectedSubmission = sortedSubmissions[selectedSubmissionIndex];

  const getStatusBadge = (submission: QuizSubmission) => {
    switch (submission.workflow_state) {
      case 'graded':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Graded</Badge>;
      case 'complete':
      case 'pending_review':
        return <Badge variant="destructive" className="text-xs">Needs Grading</Badge>;
      case 'untaken':
        return <Badge variant="secondary" className="text-xs">Not Taken</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{submission.workflow_state}</Badge>;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left side - Current student info */}
        <div className="flex items-center gap-4">
          <User className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">
              {selectedSubmission.user.name}
            </span>
            {getStatusBadge(selectedSubmission)}
            {selectedSubmission.score !== null && (
              <Badge variant="outline" className="text-xs">
                {selectedSubmission.score} pts
              </Badge>
            )}
          </div>
        </div>

        {/* Center - Student selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {selectedSubmissionIndex + 1} of {sortedSubmissions.length}
          </span>
          <Select
            value={selectedSubmissionIndex.toString()}
            onValueChange={(value) => onSubmissionSelect(parseInt(value))}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortedSubmissions.map((submission, index) => (
                <SelectItem key={submission.id} value={index.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{submission.user.sortable_name}</span>
                    <div className="flex items-center gap-2 ml-2">
                      {submission.workflow_state === 'complete' && (
                        <Badge variant="destructive" className="text-xs">Needs Grading</Badge>
                      )}
                      {submission.score !== null && (
                        <span className="text-xs text-gray-500">{submission.score} pts</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side - Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={selectedSubmissionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={selectedSubmissionIndex === sortedSubmissions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HorizontalQuizStudentNav;
