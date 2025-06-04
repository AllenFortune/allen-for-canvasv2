
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft, ArrowRight } from 'lucide-react';

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

interface QuizNavigationPanelProps {
  sortedSubmissions: QuizSubmission[];
  selectedSubmissionIndex: number;
  onSubmissionSelect: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const QuizNavigationPanel: React.FC<QuizNavigationPanelProps> = ({
  sortedSubmissions,
  selectedSubmissionIndex,
  onSubmissionSelect,
  onNavigate
}) => {
  const selectedSubmission = sortedSubmissions[selectedSubmissionIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Student Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Submission Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedSubmissionIndex + 1} of {sortedSubmissions.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('prev')}
                disabled={selectedSubmissionIndex === 0}
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('next')}
                disabled={selectedSubmissionIndex === sortedSubmissions.length - 1}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className="font-medium text-blue-900">{selectedSubmission.user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={selectedSubmission.workflow_state === 'complete' ? 'default' : 'secondary'}>
              {selectedSubmission.workflow_state}
            </Badge>
            {selectedSubmission.score !== null && (
              <Badge variant="outline">
                {selectedSubmission.score} pts
              </Badge>
            )}
          </div>
        </div>

        {/* All Submissions List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedSubmissions.map((submission, index) => (
            <Button
              key={submission.id}
              variant={index === selectedSubmissionIndex ? "default" : "outline"}
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => onSubmissionSelect(index)}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <span className="font-medium truncate">{submission.user.name}</span>
                <div className="flex items-center gap-2 text-xs">
                  <Badge 
                    variant={submission.workflow_state === 'complete' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {submission.workflow_state}
                  </Badge>
                  {submission.score !== null && (
                    <span className="text-gray-500">{submission.score} pts</span>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizNavigationPanel;
