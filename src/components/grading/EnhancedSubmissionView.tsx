
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, FileText, Link, AlertCircle } from 'lucide-react';
import { Submission } from '@/types/grading';

interface EnhancedSubmissionViewProps {
  submission: Submission;
}

const EnhancedSubmissionView: React.FC<EnhancedSubmissionViewProps> = ({ submission }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
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
    <div className="space-y-6">
      {/* Student Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={submission.user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {submission.user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{submission.user.name}</CardTitle>
              <p className="text-gray-600">{submission.user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                {getSubmissionStatusBadge(submission)}
                {submission.submitted_at && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {formatDate(submission.submitted_at)}
                  </div>
                )}
                {submission.late && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Late Submission
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Submission Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submission Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submission.body ? (
            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg border">
              <div dangerouslySetInnerHTML={{ __html: submission.body }} />
            </div>
          ) : submission.url ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Website Submission</span>
              </div>
              <a 
                href={submission.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {submission.url}
              </a>
            </div>
          ) : submission.attachments && submission.attachments.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="w-4 h-4" />
                File Attachments ({submission.attachments.length})
              </div>
              <div className="grid gap-3">
                {submission.attachments.map((attachment: any, index: number) => (
                  <a 
                    key={index}
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {attachment.filename || attachment.display_name}
                      </p>
                      {attachment.size && (
                        <p className="text-sm text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No submission content available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSubmissionView;
