
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { Submission } from '@/types/grading';

interface GradingStatusCardProps {
  submissions: Submission[];
  assignment: any;
}

const GradingStatusCard: React.FC<GradingStatusCardProps> = ({ 
  submissions, 
  assignment 
}) => {
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(sub => sub.score !== null || sub.grade !== null);
  const ungradedSubmissions = totalSubmissions - gradedSubmissions.length;
  const gradingProgress = totalSubmissions > 0 ? (gradedSubmissions.length / totalSubmissions) * 100 : 0;

  // Calculate average score for graded submissions
  const scoredSubmissions = submissions.filter(sub => sub.score !== null && sub.score !== undefined);
  const averageScore = scoredSubmissions.length > 0 
    ? scoredSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / scoredSubmissions.length 
    : 0;

  // Grade distribution (simplified)
  const maxPoints = assignment?.points_possible || 100;
  const getGradeRange = (score: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 90) return 'A (90-100%)';
    if (percentage >= 80) return 'B (80-89%)';
    if (percentage >= 70) return 'C (70-79%)';
    if (percentage >= 60) return 'D (60-69%)';
    return 'F (0-59%)';
  };

  const gradeDistribution = scoredSubmissions.reduce((acc, sub) => {
    const grade = getGradeRange(sub.score || 0);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Grading Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span>{gradedSubmissions.length} of {totalSubmissions} graded</span>
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
            <div className="text-lg font-bold text-green-800">{gradedSubmissions.length}</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Pending</span>
            </div>
            <div className="text-lg font-bold text-orange-800">{ungradedSubmissions}</div>
          </div>
        </div>

        {/* Average Score */}
        {scoredSubmissions.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Average Score</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
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

export default GradingStatusCard;
