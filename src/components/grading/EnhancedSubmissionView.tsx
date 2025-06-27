
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Link, AlertCircle, MessageCircle, Download, Eye } from 'lucide-react';
import { Submission } from '@/types/grading';
import FilePreviewModal from './FilePreviewModal';
import { getFilePreviewability, getFileTypeIcon } from '@/utils/filePreviewUtils';

interface EnhancedSubmissionViewProps {
  submission: Submission;
}

const EnhancedSubmissionView: React.FC<EnhancedSubmissionViewProps> = ({ submission }) => {
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; attachment: any | null }>({
    isOpen: false,
    attachment: null
  });

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

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreviewFile = (attachment: any) => {
    setPreviewModal({ isOpen: true, attachment });
  };

  const handleClosePreview = () => {
    setPreviewModal({ isOpen: false, attachment: null });
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
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Text Submission:</h4>
              <div className="prose max-w-none bg-gray-50 p-4 rounded-lg border">
                <div dangerouslySetInnerHTML={{ __html: submission.body }} />
              </div>
            </div>
          ) : null}

          {submission.url ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
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
          ) : null}

          {submission.attachments && submission.attachments.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="w-4 h-4" />
                File Attachments ({submission.attachments.length})
                <Badge variant="secondary" className="text-xs">
                  AI Processable
                </Badge>
              </div>
              <div className="grid gap-4">
                {submission.attachments.map((attachment: any, index: number) => {
                  const filename = attachment.filename || attachment.display_name;
                  const { canPreview } = getFilePreviewability(filename, attachment['content-type']);
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 border rounded-lg"
                    >
                      <div className="text-2xl mt-1">
                        {getFileTypeIcon(filename, attachment['content-type'])}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate mb-1">
                          {filename}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          {attachment.size && (
                            <span>{getFileSize(attachment.size)}</span>
                          )}
                          {attachment['content-type'] && (
                            <span>{attachment['content-type']}</span>
                          )}
                          {canPreview && (
                            <Badge variant="outline" className="text-xs">
                              Previewable
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {canPreview && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewFile(attachment)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex items-center gap-2 text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                <strong>AI Processing:</strong> .docx and .txt files will be automatically processed for content analysis. 
                PDF files and other formats will be noted but may require manual review.
              </div>
            </div>
          ) : null}

          {!submission.body && !submission.url && (!submission.attachments || submission.attachments.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No submission content available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Comments */}
      {submission.submission_comments && submission.submission_comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Student Comments ({submission.submission_comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submission.submission_comments.map((comment: any, index: number) => (
                <div key={index} className="border-l-4 border-l-gray-300 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-700">
                      {comment.author_name || 'Student'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800">{comment.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview Modal */}
      {previewModal.attachment && (
        <FilePreviewModal
          isOpen={previewModal.isOpen}
          onClose={handleClosePreview}
          attachment={previewModal.attachment}
        />
      )}
    </div>
  );
};

export default EnhancedSubmissionView;
