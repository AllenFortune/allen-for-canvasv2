
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DiscussionEntry } from '@/types/grading';
import { MessageCircle, Reply, User } from 'lucide-react';

interface DiscussionPostsViewProps {
  entries: DiscussionEntry[];
  studentUserId?: number;
  showContext?: boolean;
}

const DiscussionPostsView: React.FC<DiscussionPostsViewProps> = ({ 
  entries, 
  studentUserId,
  showContext = true 
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

  // Group entries by type for better organization
  const initialPosts = entries.filter(entry => !entry.parent_id && entry.user_id === studentUserId);
  const replies = entries.filter(entry => entry.parent_id && entry.user_id === studentUserId);
  const contextPosts = entries.filter(entry => entry.user_id !== studentUserId);

  console.log('Filtered posts:', {
    initialPosts: initialPosts.length,
    replies: replies.length,
    contextPosts: contextPosts.length,
    allEntries: entries.length
  });

  // Debug parent_id relationships
  console.log('Parent ID analysis:', {
    entriesWithParentId: entries.filter(e => e.parent_id).length,
    parentIds: entries.filter(e => e.parent_id).map(e => ({ id: e.id, parent_id: e.parent_id, user_id: e.user_id })),
    availableEntryIds: entries.map(e => e.id)
  });

  if (entries.length === 0) {
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
            <p>No discussion posts found for this student.</p>
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
          Discussion Posts ({entries.filter(e => e.user_id === studentUserId).length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Information */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h4>
          <div className="text-xs space-y-1 text-yellow-700">
            <p>Total entries: {entries.length}</p>
            <p>Student entries: {entries.filter(e => e.user_id === studentUserId).length}</p>
            <p>Initial posts: {initialPosts.length}</p>
            <p>Replies: {replies.length}</p>
            <p>Context posts: {contextPosts.length}</p>
            <p>Entries with parent_id: {entries.filter(e => e.parent_id).length}</p>
          </div>
        </div>

        {/* Initial Posts Section */}
        {initialPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Initial Posts ({initialPosts.length})
            </h4>
            <div className="space-y-4">
              {initialPosts.map((entry) => (
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
                  <div className="mt-2 text-xs text-gray-500">
                    Entry ID: {entry.id} | Parent ID: {entry.parent_id || 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Replies Section */}
        {replies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Reply className="w-4 h-4" />
              Replies to Classmates ({replies.length})
            </h4>
            <div className="space-y-4">
              {replies.map((reply) => {
                const originalPost = contextPosts.find(p => p.id === reply.parent_id);
                
                return (
                  <div key={reply.id} className="space-y-3">
                    {/* Show original post for context if available */}
                    {showContext && originalPost && (
                      <div className="p-3 bg-gray-100 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={originalPost.user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-gray-300">
                              {getUserInitials(originalPost.user)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700">
                            {getUserName(originalPost.user)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Original Post
                          </Badge>
                        </div>
                        <div 
                          className="prose prose-sm max-w-none text-gray-600 text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: originalPost.message.length > 300 
                              ? originalPost.message.substring(0, 300) + '...'
                              : originalPost.message 
                          }}
                        />
                        <div className="mt-1 text-xs text-gray-400">
                          Original Entry ID: {originalPost.id}
                        </div>
                      </div>
                    )}
                    
                    {/* Student's reply */}
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg ml-4">
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
                          </div>
                          <span className="text-sm text-gray-600">{formatDate(reply.created_at)}</span>
                        </div>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: reply.message }}
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        Reply ID: {reply.id} | Parent ID: {reply.parent_id} | {originalPost ? 'Original found' : 'Original NOT found'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show all entries for debugging if no proper categorization */}
        {initialPosts.length === 0 && replies.length === 0 && entries.filter(e => e.user_id === studentUserId).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              All Student Entries (Debug View)
            </h4>
            <div className="space-y-4">
              {entries.filter(e => e.user_id === studentUserId).map((entry) => (
                <div key={entry.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={entry.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-red-100">
                        {getUserInitials(entry.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-800">{getUserName(entry.user)}</span>
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          {entry.parent_id ? 'Has Parent ID' : 'No Parent ID'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: entry.message }}
                  />
                  <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border">
                    <strong>Raw Data:</strong><br />
                    ID: {entry.id}<br />
                    Parent ID: {entry.parent_id || 'null'}<br />
                    User ID: {entry.user_id}<br />
                    Created: {entry.created_at}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Participation Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{initialPosts.length}</div>
              <div className="text-gray-600">Initial Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{replies.length}</div>
              <div className="text-gray-600">Replies</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {initialPosts.length + replies.length}
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
