
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscussionEntry } from '@/types/grading';

interface DiscussionPostsViewProps {
  entries: DiscussionEntry[];
}

const DiscussionPostsView: React.FC<DiscussionPostsViewProps> = ({ entries }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion Posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <span className="font-medium">{entry.user.name}</span>
              <span>•</span>
              <span>{formatDate(entry.created_at)}</span>
            </div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.message }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DiscussionPostsView;
