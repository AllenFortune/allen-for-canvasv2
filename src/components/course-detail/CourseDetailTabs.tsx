
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentsList from './AssignmentsList';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  needs_grading_count: number;
  submission_types: string[];
}

interface CourseDetailTabsProps {
  assignments: Assignment[];
  assignmentsLoading: boolean;
  totalNeedsGrading: number;
}

const CourseDetailTabs: React.FC<CourseDetailTabsProps> = ({ 
  assignments, 
  assignmentsLoading, 
  totalNeedsGrading 
}) => {
  return (
    <Tabs defaultValue="assignments" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="assignments" className="relative">
          Assignments
          {totalNeedsGrading > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalNeedsGrading}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="discussions">Discussions</TabsTrigger>
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="assignments" className="mt-6">
        <AssignmentsList assignments={assignments} assignmentsLoading={assignmentsLoading} />
      </TabsContent>
      
      <TabsContent value="discussions">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Discussions feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="quizzes">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Quizzes feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="students">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Students feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Analytics feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CourseDetailTabs;
