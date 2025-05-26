import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Submission } from '@/types/grading';

interface StudentSubmissionViewProps {
  submission: Submission;
}

const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = ({ submission }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.workflow_state === 'graded') {
      return <Badge className="bg-green-500">Graded</Badge>;
    } else if (submission.missing) {
      return <Badge variant="destructive">Missing</Badge>;
    } else if (submission.late) {
      return <Badge className="bg-yellow-500">Late</Badge>;
    } else if (submission.submitted_at) {
      return <Badge>Submitted</Badge>;
    } else {
      return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <>
      {/* Student Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={submission.user.avatar_url || undefined} />
              <AvatarFallback>
                {submission.user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{submission.user.name}</CardTitle>
              <p className="text-gray-600">{submission.user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {getSubmissionStatusBadge(submission)}
                {submission.submitted_at && (
                  <span className="text-sm text-gray-600">
                    Submitted: {formatDate(submission.submitted_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Submission Content */}
      <Card>
        <CardHeader>
          <CardTitle>Submission</CardTitle>
        </CardHeader>
        <CardContent>
          {submission.body ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: submission.body }} />
            </div>
          ) : submission.url ? (
            <div>
              <p className="mb-2">Website submission:</p>
              <a 
                href={submission.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {submission.url}
              </a>
            </div>
          ) : submission.attachments && submission.attachments.length > 0 ? (
            <div>
              <p className="mb-2">File attachments:</p>
              <div className="space-y-2">
                {submission.attachments.map((attachment: any, index: number) => (
                  <a 
                    key={index}
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-2 border rounded hover:bg-gray-50"
                  >
                    {attachment.filename || attachment.display_name}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No submission content available.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default StudentSubmissionView;
