
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { DiscussionEntry } from '@/types/grading';
import DiscussionPostSection from './DiscussionPostSection';
import ParticipationSummary from './ParticipationSummary';
import DiscussionEmptyState from './DiscussionEmptyState';

interface DiscussionPostsViewProps {
  entries: DiscussionEntry[];
  studentUserId?: number;
  showContext?: boolean;
}

const DiscussionPostsView: React.FC<DiscussionPostsViewProps> = ({ 
  entries, 
  studentUserId,
  showContext = false
}) => {
  console.log('DiscussionPostsView received entries:', entries);
  console.log('Student user ID:', studentUserId);
  
  const getUserName = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'Unknown User';
    }
    return user.name;
  };

  // Filter entries to only show the student being graded
  const studentEntries = entries.filter(entry => entry.user_id === studentUserId);
  
  // Separate student's initial posts and replies
  const studentInitialPosts = studentEntries.filter(entry => !entry.parent_id);
  const studentReplies = studentEntries.filter(entry => entry.parent_id);

  // Create a map of all entries for context lookup
  const entryMap = entries.reduce((acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  }, {} as Record<number, DiscussionEntry>);

  console.log('Filtered student posts:', {
    initialPosts: studentInitialPosts.length,
    replies: studentReplies.length,
    totalStudentEntries: studentEntries.length
  });

  if (studentEntries.length === 0) {
    return <DiscussionEmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {getUserName(studentEntries[0].user)}'s Discussion Posts ({studentEntries.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DiscussionPostSection
          title="Initial Discussion Posts"
          icon="initial"
          posts={studentInitialPosts}
          entryMap={entryMap}
        />

        <DiscussionPostSection
          title="Replies to Classmates"
          icon="reply"
          posts={studentReplies}
          entryMap={entryMap}
        />

        <ParticipationSummary
          initialPostsCount={studentInitialPosts.length}
          repliesCount={studentReplies.length}
        />
      </CardContent>
    </Card>
  );
};

export default DiscussionPostsView;
