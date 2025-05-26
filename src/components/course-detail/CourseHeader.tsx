
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
}

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
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
    <div className="mb-8">
      <Link to="/courses" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Link>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(course.workflow_state)}`}>
              {getStatusLabel(course.workflow_state)}
            </span>
          </div>
          <p className="text-gray-600">{course.course_code}</p>
        </div>
        
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in Canvas
        </Button>
      </div>
    </div>
  );
};

export default CourseHeader;
