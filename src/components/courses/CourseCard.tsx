
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Info, Archive } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
  sis_term_id?: string;
  term?: {
    id: number;
    name: string;
    start_at: string | null;
    end_at: string | null;
    sis_term_id?: string;
  };
}

interface CourseCardProps {
  course: Course;
  needsGradingCount?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, needsGradingCount = 0 }) => {
  // Debug logging for term data
  console.log(`Course ${course.id} term data:`, course.term);
  console.log(`Course ${course.id} sis_term_id:`, course.sis_term_id);
  console.log(`Course ${course.id} course_code:`, course.course_code);

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

  const isNonLatinScript = (text: string): boolean => {
    // Check if text contains Arabic, Chinese, Japanese, Korean, or other non-Latin scripts
    const nonLatinRegex = /[\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/;
    return nonLatinRegex.test(text);
  };

  const parseTermFromCourseCode = (courseCode: string): string | null => {
    // Try to extract term info from course codes like "2020/FA", "2017/SP", etc.
    const termPatterns = [
      /(\d{4})\/(FA|SP|SU)/i, // 2020/FA format
      /(\d{4})\s*(Fall|Spring|Summer)/i, // 2020 Fall format
      /(Fall|Spring|Summer)\s*(\d{4})/i, // Fall 2020 format
      /(\d{4})-(\d{1,2})/i, // 2020-1 format (where 1=Fall, 2=Spring, 3=Summer)
    ];

    for (const pattern of termPatterns) {
      const match = courseCode.match(pattern);
      if (match) {
        if (match[2] && match[1]) {
          const year = match[1];
          const semester = match[2].toUpperCase();
          
          // Convert to standard format
          const semesterMap: { [key: string]: string } = {
            'FA': 'Fall',
            'SP': 'Spring',
            'SU': 'Summer',
            'FALL': 'Fall',
            'SPRING': 'Spring',
            'SUMMER': 'Summer'
          };
          
          return `${semesterMap[semester] || semester} ${year}`;
        }
      }
    }
    
    return null;
  };

  const generateEnglishTermName = (term: Course['term'], courseCode: string): string => {
    // First try to parse from course code
    const parsedTerm = parseTermFromCourseCode(courseCode);
    if (parsedTerm) {
      console.log(`Extracted term "${parsedTerm}" from course code "${courseCode}"`);
      return parsedTerm;
    }

    // If no term object, return unknown
    if (!term) return 'Unknown Term';

    // Try using sis_term_id if available
    if (term.sis_term_id) {
      const sisTermParsed = parseTermFromCourseCode(term.sis_term_id);
      if (sisTermParsed) return sisTermParsed;
    }

    // If we have dates, try to generate a meaningful English name
    if (term.start_at) {
      const startDate = new Date(term.start_at);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();

      // Determine semester based on start month
      if (month >= 8 || month <= 0) { // September - January
        return `Fall ${year}`;
      } else if (month >= 1 && month <= 4) { // February - May
        return `Spring ${year}`;
      } else if (month >= 5 && month <= 7) { // June - August
        return `Summer ${year}`;
      }
    }

    // Fallback to term ID if available
    return `Term ${term.id}`;
  };

  const getTermDisplay = () => {
    // First check if we have a meaningful term name
    const termName = course.term?.name?.trim();
    
    // Check if term name is meaningful (not "Default Term" and not non-Latin)
    const isMeaningfulTerm = termName && 
                            termName !== 'Default Term' && 
                            !isNonLatinScript(termName) &&
                            termName.length > 0;
    
    let displayName: string;
    
    if (isMeaningfulTerm) {
      displayName = termName!;
    } else {
      // Use our enhanced term generation
      displayName = generateEnglishTermName(course.term, course.course_code);
      
      if (termName && isNonLatinScript(termName)) {
        console.log(`Converted non-Latin term "${termName}" to "${displayName}" for course ${course.id}`);
      } else if (termName === 'Default Term') {
        console.log(`Replaced "Default Term" with "${displayName}" for course ${course.id}`);
      }
    }
    
    // Add term dates if available for better context
    if (course.term?.start_at && course.term?.end_at) {
      return `${displayName} (${formatDate(course.term.start_at)} - ${formatDate(course.term.end_at)})`;
    } else if (course.term?.start_at) {
      return `${displayName} (Started ${formatDate(course.term.start_at)})`;
    } else if (course.term?.end_at) {
      return `${displayName} (Ends ${formatDate(course.term.end_at)})`;
    }
    
    return displayName;
  };

  const isPastCourse = (): boolean => {
    const now = new Date();
    
    // Check term end date first
    if (course.term?.end_at) {
      const termEndDate = new Date(course.term.end_at);
      if (termEndDate < now) return true;
    }
    
    // Check course end date
    if (course.end_at) {
      const courseEndDate = new Date(course.end_at);
      if (courseEndDate < now) return true;
    }
    
    // Check workflow state for concluded courses
    if (course.workflow_state === 'completed' || course.workflow_state === 'concluded') {
      return true;
    }
    
    return false;
  };

  const getStatusBadgeColor = (status: string, isPast: boolean) => {
    if (isPast) {
      return 'bg-gray-500 text-white';
    }
    
    switch (status) {
      case 'available':
        return 'bg-green-600 text-white';
      case 'unpublished':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status: string, isPast: boolean) => {
    if (isPast) {
      return 'Past';
    }
    
    switch (status) {
      case 'available':
        return 'Active';
      case 'unpublished':
        return 'Unpublished';
      default:
        return status;
    }
  };

  const isCoursePast = isPastCourse();

  return (
    <Card className={`hover:shadow-md transition-shadow relative ${isCoursePast ? 'opacity-75' : ''}`}>
      {needsGradingCount > 0 && !isCoursePast && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
          {needsGradingCount}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${isCoursePast ? 'text-gray-600' : ''}`}>
            <div className="flex items-center gap-2">
              {isCoursePast && <Archive className="w-4 h-4" />}
              {course.name}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(course.workflow_state, isCoursePast)}`}>
              {getStatusLabel(course.workflow_state, isCoursePast)}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{course.course_code}</p>
        <p className="text-gray-500 text-xs">Term: {getTermDisplay()}</p>
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
          {isCoursePast && (
            <div className="flex items-start gap-2 text-gray-500 text-xs bg-gray-50 p-2 rounded">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>This course has ended. Some features may be limited.</span>
            </div>
          )}
          {!isCoursePast && (
            <div className="flex items-start gap-2 text-gray-500 text-xs bg-blue-50 p-2 rounded">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>To manage favorites, use the star icon in your Canvas course list</span>
            </div>
          )}
          <Link to={`/courses/${course.id}`}>
            <Button className={`w-full mt-4 ${isCoursePast ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}>
              View Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
