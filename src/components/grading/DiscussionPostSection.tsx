
import React from 'react';
import { MessageCircle, Reply } from 'lucide-react';
import { DiscussionEntry } from '@/types/grading';
import DiscussionPost from './DiscussionPost';

interface DiscussionPostSectionProps {
  title: string;
  icon: 'initial' | 'reply';
  posts: DiscussionEntry[];
  entryMap: Record<number, DiscussionEntry>;
}

const DiscussionPostSection: React.FC<DiscussionPostSectionProps> = ({
  title,
  icon,
  posts,
  entryMap
}) => {
  const IconComponent = icon === 'initial' ? MessageCircle : Reply;
  const isReplySection = icon === 'reply';

  if (posts.length === 0) {
    return null;
  }

  const getUserName = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'Unknown User';
    }
    return user.name;
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <IconComponent className="w-4 h-4" />
        {title} ({posts.length})
      </h4>
      <div className="space-y-4">
        {posts.map((post) => {
          const replyToUser = isReplySection && post.parent_id 
            ? getUserName(entryMap[post.parent_id]?.user)
            : undefined;
          
          return (
            <DiscussionPost
              key={post.id}
              entry={post}
              type={isReplySection ? 'reply' : 'initial'}
              replyToUser={replyToUser}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionPostSection;
