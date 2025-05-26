
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DiscussionEntry } from '@/types/grading';
import { MessageCircle, Reply } from 'lucide-react';

interface DiscussionPostsViewProps {
  entries: DiscussionEntry[];
  studentUserId?: number;
  showContext?: boolean;
}

const DiscussionPostsView: React.FC<DiscussionPostsViewProps> = ({ 
  entries, 
  studentUserId,
  showContext = false // Default to false to hide context
}) => {
  console.log('DiscussionPostsView received entries:', entries);
  console.log('Student user ID:', studentUserId);
  
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
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Discussion Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>This student has not participated in the discussion yet.</p>
          </div>
        </CardContent>
      </Card>
    );
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
        {/* Student's Initial Posts Section - Show First */}
        {studentInitialPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Initial Discussion Posts ({studentInitialPosts.length})
            </h4>
            <div className="space-y-4">
              {studentInitialPosts.map((entry) => (
                <div key={entry.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={entry.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-blue-100">
                        {getUserInitials(entry.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-800">{getUserName(entry.user)}</span>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          Initial Post
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: entry.message }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student's Replies Section - Show After Initial Posts */}
        {studentReplies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Reply className="w-4 h-4" />
              Replies to Classmates ({studentReplies.length})
            </h4>
            <div className="space-y-4">
              {studentReplies.map((reply) => {
                const originalPost = entryMap[reply.parent_id!];
                
                return (
                  <div key={reply.id} className="space-y-3">
                    {/* Student's reply with minimal context */}
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.user.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-green-100">
                            {getUserInitials(reply.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-800">{getUserName(reply.user)}</span>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              Reply
                            </Badge>
                            {originalPost && (
                              <span className="text-xs text-gray-500">
                                to {getUserName(originalPost.user)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{formatDate(reply.created_at)}</span>
                        </div>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: reply.message }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Participation Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{studentInitialPosts.length}</div>
              <div className="text-gray-600">Initial Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{studentReplies.length}</div>
              <div className="text-gray-600">Replies</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {studentInitialPosts.length + studentReplies.length}
              </div>
              <div className="text-gray-600">Total Posts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionPostsView;
