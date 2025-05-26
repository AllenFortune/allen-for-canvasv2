import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentsList from './AssignmentsList';
import DiscussionsList from './DiscussionsList';
import QuizzesList from './QuizzesList';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  needs_grading_count: number;
  submission_types: string[];
}

interface Discussion {
  id: number;
  title: string;
  posted_at: string | null;
  discussion_type: string;
  unread_count: number;
  todo_date: string | null;
}

interface Quiz {
  id: number;
  title: string;
  due_at: string | null;
  points_possible: number | null;
  quiz_type: string;
  time_limit: number | null;
  allowed_attempts: number | null;
  published: boolean;
  needs_grading_count?: number;
}

interface CourseDetailTabsProps {
  assignments: Assignment[];
  assignmentsLoading: boolean;
  discussions: Discussion[];
  discussionsLoading: boolean;
  quizzes: Quiz[];
  quizzesLoading: boolean;
  totalNeedsGrading: number;
  totalUnread: number;
}

const CourseDetailTabs: React.FC<CourseDetailTabsProps> = ({ 
  assignments, 
  assignmentsLoading, 
  discussions,
  discussionsLoading,
  quizzes,
  quizzesLoading,
  totalNeedsGrading,
  totalUnread
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
        <TabsTrigger value="discussions" className="relative">
          Discussions
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="assignments" className="mt-6">
        <AssignmentsList assignments={assignments} assignmentsLoading={assignmentsLoading} />
      </TabsContent>
      
      <TabsContent value="discussions" className="mt-6">
        <DiscussionsList discussions={discussions} discussionsLoading={discussionsLoading} />
      </TabsContent>
      
      <TabsContent value="quizzes" className="mt-6">
        <QuizzesList quizzes={quizzes} quizzesLoading={quizzesLoading} />
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
