
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DiscussionEntry } from '@/types/grading';
import { sanitizeUserContent } from '@/utils/sanitizeHtml';

interface DiscussionPostProps {
  entry: DiscussionEntry;
  type: 'initial' | 'reply';
  replyToUser?: string;
}

const DiscussionPost: React.FC<DiscussionPostProps> = ({ entry, type, replyToUser }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'U';
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getUserName = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'Unknown User';
    }
    return user.name;
  };

  const isInitialPost = type === 'initial';
  const borderColor = isInitialPost ? 'border-blue-500' : 'border-green-500';
  const bgColor = isInitialPost ? 'bg-blue-50' : 'bg-green-50';
  const badgeColor = isInitialPost ? 'text-blue-700 border-blue-300' : 'text-green-700 border-green-300';
  const avatarBg = isInitialPost ? 'bg-blue-100' : 'bg-green-100';
  const userNameColor = isInitialPost ? 'text-blue-800' : 'text-green-800';

  return (
    <div className={`p-4 border-l-4 ${borderColor} ${bgColor} rounded-r-lg`}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={entry.user.avatar_url || undefined} />
          <AvatarFallback className={`text-xs ${avatarBg}`}>
            {getUserInitials(entry.user)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${userNameColor}`}>{getUserName(entry.user)}</span>
            <Badge variant="outline" className={badgeColor}>
              {isInitialPost ? 'Initial Post' : 'Reply'}
            </Badge>
            {replyToUser && (
              <span className="text-xs text-gray-500">
                to {replyToUser}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">{formatDate(entry.created_at)}</span>
        </div>
      </div>
      <div 
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: sanitizeUserContent(entry.message) }}
      />
    </div>
  );
};

export default DiscussionPost;
