
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight } from 'lucide-react';

interface QuizSubmission {
  id: number;
  user_id: number;
  workflow_state: string;
  score: number | null;
  user: {
    id: number;
    name: string;
    sortable_name: string;
  };
}

interface QuizStudentNavigationProps {
  submissions: QuizSubmission[];
  currentIndex: number;
  onStudentSelect: (index: number) => void;
}

const QuizStudentNavigation: React.FC<QuizStudentNavigationProps> = ({
  submissions,
  currentIndex,
  onStudentSelect
}) => {
  const getStatusBadge = (submission: QuizSubmission) => {
    switch (submission.workflow_state) {
      case 'graded':
        return <Badge variant="default" className="bg-green-100 text-green-800">Graded</Badge>;
      case 'complete':
      case 'pending_review':
        return <Badge variant="destructive">Needs Grading</Badge>;
      case 'untaken':
        return <Badge variant="secondary">Not Taken</Badge>;
      default:
        return <Badge variant="outline">{submission.workflow_state}</Badge>;
    }
  };

  // Create sorted submissions with original indices preserved
  const sortedSubmissionsWithIndex = submissions
    .map((submission, originalIndex) => ({ submission, originalIndex }))
    .sort((a, b) => a.submission.user.sortable_name.localeCompare(b.submission.user.sortable_name));

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Students ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {sortedSubmissionsWithIndex.map(({ submission, originalIndex }) => (
            <Button
              key={submission.id}
              variant={originalIndex === currentIndex ? "secondary" : "ghost"}
              className="w-full justify-between p-4 h-auto rounded-none border-b last:border-b-0"
              onClick={() => onStudentSelect(originalIndex)}
            >
              <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                <span className="font-medium text-sm truncate w-full text-left">
                  {submission.user.sortable_name}
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission)}
                  {submission.score !== null && (
                    <span className="text-xs text-gray-600">
                      Score: {submission.score}
                    </span>
                  )}
                </div>
              </div>
              {originalIndex === currentIndex && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStudentNavigation;
