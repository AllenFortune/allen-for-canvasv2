
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { formatDate } from './utils/quizSubmissionUtils';

interface QuizSubmission {
  id: number;
  attempt: number;
  started_at: string | null;
  finished_at: string | null;
  workflow_state: string;
  user: {
    name: string;
    sortable_name: string;
  };
}

interface QuizSubmissionInfoProps {
  submission: QuizSubmission;
}

const QuizSubmissionInfo: React.FC<QuizSubmissionInfoProps> = ({ submission }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {submission.user.sortable_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Attempt:</span> {submission.attempt}
          </div>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <Badge variant={submission.workflow_state === 'graded' ? 'default' : 'destructive'}>
              {submission.workflow_state}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Started:</span> {formatDate(submission.started_at)}
          </div>
          <div>
            <span className="font-medium">Finished:</span> {formatDate(submission.finished_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSubmissionInfo;
