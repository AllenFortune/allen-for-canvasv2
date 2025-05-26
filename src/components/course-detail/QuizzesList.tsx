import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

interface QuizzesListProps {
  quizzes: Quiz[];
  quizzesLoading: boolean;
}

const QuizzesList: React.FC<QuizzesListProps> = ({ quizzes, quizzesLoading }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizTypeBadge = (quizType: string) => {
    const type = quizType || 'practice_quiz';
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'practice_quiz': 'secondary',
      'assignment': 'default',
      'graded_survey': 'outline',
      'survey': 'outline'
    };
    
    return (
      <Badge variant={variants[type] || 'secondary'}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (quizzesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading quizzes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">No quizzes found for this course.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quizzes ({quizzes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quiz Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Needs Grading</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{getQuizTypeBadge(quiz.quiz_type)}</TableCell>
                <TableCell>{formatDate(quiz.due_at)}</TableCell>
                <TableCell>{quiz.points_possible || 'Ungraded'}</TableCell>
                <TableCell>
                  {quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}
                </TableCell>
                <TableCell>
                  {quiz.allowed_attempts === -1 ? 'Unlimited' : quiz.allowed_attempts || '1'}
                </TableCell>
                <TableCell>
                  <Badge variant={quiz.published ? 'default' : 'secondary'}>
                    {quiz.published ? 'Published' : 'Unpublished'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {quiz.needs_grading_count && quiz.needs_grading_count > 0 ? (
                    <Badge variant="destructive">{quiz.needs_grading_count}</Badge>
                  ) : (
                    <span className="text-gray-500">0</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuizzesList;
