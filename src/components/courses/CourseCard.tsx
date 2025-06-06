
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Info } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
}

interface CourseCardProps {
  course: Course;
  needsGradingCount?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, needsGradingCount = 0 }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No dates set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDateRange = (startAt: string | null, endAt: string | null) => {
    if (!startAt && !endAt) return 'No dates set';
    if (!startAt) return `Ends ${formatDate(endAt)}`;
    if (!endAt) return `Started ${formatDate(startAt)}`;
    return `${formatDate(startAt)} - ${formatDate(endAt)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-600 text-white';
      case 'unpublished':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Active';
      case 'unpublished':
        return 'Unpublished';
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      {needsGradingCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
          {needsGradingCount}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{course.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(course.workflow_state)}`}>
              {getStatusLabel(course.workflow_state)}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{course.course_code}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            {getDateRange(course.start_at, course.end_at)}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2" />
            {course.total_students > 0 ? `${course.total_students} students` : 'Unknown students'}
          </div>
          <div className="flex items-start gap-2 text-gray-500 text-xs bg-blue-50 p-2 rounded">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>To manage favorites, use the star icon in your Canvas course list</span>
          </div>
          <Link to={`/courses/${course.id}`}>
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-4">
              View Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
