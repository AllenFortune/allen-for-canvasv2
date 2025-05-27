
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MessageSquare, BarChart3, ArrowLeft } from 'lucide-react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';
import DiscussionGradingStatusCard from './DiscussionGradingStatusCard';

interface EnhancedDiscussionHeaderProps {
  courseId: string;
  discussion: Discussion | null;
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
}

const EnhancedDiscussionHeader: React.FC<EnhancedDiscussionHeaderProps> = ({
  courseId,
  discussion,
  entries,
  grades
}) => {
  const navigate = useNavigate();

  if (!discussion) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate the correct points possible value
  const getDisplayPoints = () => {
    // First check if discussion has points_possible directly
    if (discussion.points_possible && discussion.points_possible > 0) {
      return discussion.points_possible;
    }
    
    // Then check if the linked assignment has points_possible
    if (discussion.assignment?.points_possible && discussion.assignment.points_possible > 0) {
      return discussion.assignment.points_possible;
    }
    
    // Return 0 if no points found (for display purposes)
    return 0;
  };

  // Group entries by user to get unique participants
  const userEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = [];
    }
    acc[entry.user_id].push(entry);
    return acc;
  }, {} as Record<number, DiscussionEntry[]>);

  const totalParticipants = Object.keys(userEntries).length;
  const totalPosts = entries.length;
  const displayPoints = getDisplayPoints();

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb and Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="hover:text-gray-700 transition-colors"
          >
            Course
          </button>
          <span>/</span>
          <span>Grade Discussion</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{discussion.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {formatDate(discussion.posted_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{displayPoints} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{totalParticipants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{totalPosts} posts</span>
                </div>
              </div>
            </div>

            {discussion.message && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Discussion Prompt</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: discussion.message }}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <DiscussionGradingStatusCard 
              discussion={discussion}
              entries={entries}
              grades={grades}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDiscussionHeader;
