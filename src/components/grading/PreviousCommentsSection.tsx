
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';
import { SubmissionComment } from '@/types/grading';
import { sanitizeUserContent } from '@/utils/sanitizeHtml';

interface PreviousCommentsSectionProps {
  comments: SubmissionComment[];
}

const PreviousCommentsSection: React.FC<PreviousCommentsSectionProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Previous Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author?.avatar_image_url} />
                <AvatarFallback className="text-xs">
                  {getAuthorInitials(comment.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.created_at)}
                    {comment.edited_at && (
                      <span className="ml-1">(edited {formatDate(comment.edited_at)})</span>
                    )}
                  </div>
                </div>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizeUserContent(comment.comment) }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviousCommentsSection;
