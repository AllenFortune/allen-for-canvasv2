
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageCircle, TrendingUp } from 'lucide-react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';

interface DiscussionGradingStatusCardProps {
  discussion: Discussion;
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
}

const DiscussionGradingStatusCard: React.FC<DiscussionGradingStatusCardProps> = ({ 
  discussion,
  entries,
  grades
}) => {
  // Group entries by user to get unique participants
  const userEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = {
        user: entry.user,
        entries: []
      };
    }
    acc[entry.user_id].entries.push(entry);
    return acc;
  }, {} as Record<number, { user: DiscussionEntry['user']; entries: DiscussionEntry[] }>);

  const totalParticipants = Object.keys(userEntries).length;
  const gradedParticipants = grades.filter(g => g.score !== null || g.grade !== null);
  const ungradedParticipants = totalParticipants - gradedParticipants.length;
  const gradingProgress = totalParticipants > 0 ? (gradedParticipants.length / totalParticipants) * 100 : 0;

  // Calculate average score for graded participants
  const scoredGrades = grades.filter(g => g.score !== null && g.score !== undefined);
  const averageScore = scoredGrades.length > 0 
    ? scoredGrades.reduce((sum, g) => sum + (g.score || 0), 0) / scoredGrades.length 
    : 0;

  // Discussion-specific metrics
  const totalPosts = entries.length;
  const initialPosts = entries.filter(entry => !entry.parent_id).length;
  const replies = entries.filter(entry => entry.parent_id).length;
  const averagePostsPerParticipant = totalParticipants > 0 ? totalPosts / totalParticipants : 0;

  // Grade distribution
  const maxPoints = discussion?.points_possible || 100;
  const getGradeRange = (score: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 90) return 'A (90-100%)';
    if (percentage >= 80) return 'B (80-89%)';
    if (percentage >= 70) return 'C (70-79%)';
    if (percentage >= 60) return 'D (60-69%)';
    return 'F (0-59%)';
  };

  const gradeDistribution = scoredGrades.reduce((acc, grade) => {
    const gradeRange = getGradeRange(grade.score || 0);
    acc[gradeRange] = (acc[gradeRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Discussion Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Grading Progress</span>
            <span>{gradedParticipants.length} of {totalParticipants} graded</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${gradingProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 text-center">
            {gradingProgress.toFixed(1)}% complete
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Graded</span>
            </div>
            <div className="text-lg font-bold text-green-800">{gradedParticipants.length}</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Pending</span>
            </div>
            <div className="text-lg font-bold text-orange-800">{ungradedParticipants}</div>
          </div>
        </div>

        {/* Discussion Engagement */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Discussion Engagement</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-blue-800 font-bold">{totalPosts}</div>
              <div className="text-blue-600">Total Posts</div>
            </div>
            <div>
              <div className="text-blue-800 font-bold">{totalParticipants}</div>
              <div className="text-blue-600">Participants</div>
            </div>
            <div>
              <div className="text-blue-800 font-bold">{initialPosts}</div>
              <div className="text-blue-600">Initial Posts</div>
            </div>
            <div>
              <div className="text-blue-800 font-bold">{replies}</div>
              <div className="text-blue-600">Replies</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Average: {averagePostsPerParticipant.toFixed(1)} posts per participant
          </div>
        </div>

        {/* Average Score */}
        {scoredGrades.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Average Score</span>
            </div>
            <div className="text-lg font-bold text-purple-800">
              {averageScore.toFixed(1)} / {maxPoints}
              <span className="text-sm font-normal ml-1">
                ({((averageScore / maxPoints) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Grade Distribution */}
        {Object.keys(gradeDistribution).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Distribution</h4>
            <div className="space-y-1">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex justify-between text-xs">
                  <span className="text-gray-600">{grade}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscussionGradingStatusCard;
