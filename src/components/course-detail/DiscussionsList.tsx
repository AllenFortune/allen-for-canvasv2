
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Discussion {
  id: number;
  title: string;
  posted_at: string | null;
  discussion_type: string;
  unread_count: number;
  todo_date: string | null;
  assignment_id?: number;
  is_assignment?: boolean;
  needs_grading_count?: number;
  graded_count?: number;
  total_submissions?: number;
}

interface DiscussionsListProps {
  discussions: Discussion[];
  discussionsLoading: boolean;
  courseId?: string;
}

const DiscussionsList: React.FC<DiscussionsListProps> = ({
  discussions,
  discussionsLoading,
  courseId
}) => {
  const navigate = useNavigate();

  console.log('DiscussionsList rendered with:', { courseId, discussionsCount: discussions.length });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleGradeDiscussion = (discussionId: number) => {
    console.log('Grade button clicked for discussion:', { courseId, discussionId });
    
    if (!courseId) {
      console.error('No courseId available for navigation');
      alert('Error: Course ID is missing. Please refresh the page and try again.');
      return;
    }

    const path = `/courses/${courseId}/discussions/${discussionId}/grade`;
    console.log('Navigating to:', path);
    
    try {
      navigate(path);
      console.log('Navigation attempted successfully');
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Navigation failed. Please try again.');
    }
  };

  const getGradingStatusIndicator = (discussion: Discussion) => {
    if (!discussion.is_assignment) {
      return null;
    }

    const needsGrading = discussion.needs_grading_count || 0;

    if (needsGrading > 0) {
      return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
          {needsGrading}
        </div>
      );
    }

    return null;
  };

  const getGradingStatusText = (discussion: Discussion) => {
    if (!discussion.is_assignment) {
      return null;
    }

    const needsGrading = discussion.needs_grading_count || 0;
    const graded = discussion.graded_count || 0;
    const total = discussion.total_submissions || 0;

    if (needsGrading > 0) {
      return (
        <span className="text-red-600 font-medium">
          {needsGrading} need{needsGrading !== 1 ? '' : 's'} grading
        </span>
      );
    } else if (graded > 0) {
      return (
        <span className="text-green-600 font-medium">
          {graded} graded
        </span>
      );
    } else if (total === 0) {
      return (
        <span className="text-gray-500">
          No submissions yet
        </span>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussions</CardTitle>
        <p className="text-gray-600">Manage and moderate discussions for this course</p>
        {!courseId && (
          <p className="text-red-600 text-sm">Warning: Course ID is missing</p>
        )}
      </CardHeader>
      <CardContent>
        {discussionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading discussions...</p>
          </div>
        ) : discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map(discussion => (
              <div key={discussion.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 relative">
                {getGradingStatusIndicator(discussion)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{discussion.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Posted: {formatDate(discussion.posted_at)}</span>
                    <span className="capitalize">{discussion.discussion_type || 'Discussion'}</span>
                    {getGradingStatusText(discussion)}
                  </div>
                </div>
                {discussion.is_assignment && (
                  <Button 
                    onClick={() => handleGradeDiscussion(discussion.id)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    disabled={!courseId}
                  >
                    Grade
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No discussions found for this course.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscussionsList;
