
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
}

interface QuizzesListProps {
  quizzes: Quiz[];
  quizzesLoading: boolean;
}

const QuizzesList: React.FC<QuizzesListProps> = ({ quizzes, quizzesLoading }) => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

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
    // Always show "Quiz" for items in the QuizzesList, regardless of Canvas quiz_type
    return (
      <Badge variant="default">
        Quiz
      </Badge>
    );
  };

  const handleGradeClick = (quizId: number) => {
    navigate(`/courses/${courseId}/quizzes/${quizId}/grade`);
  };

  // Filter quizzes that might need grading (assignments and graded surveys)
  const gradeableQuizzes = quizzes.filter(quiz => 
    quiz.quiz_type === 'assignment' || quiz.quiz_type === 'graded_survey'
  );

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
        {gradeableQuizzes.length > 0 && (
          <p className="text-sm text-gray-600">
            {gradeableQuizzes.length} quiz{gradeableQuizzes.length !== 1 ? 'es' : ''} may require grading
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quiz Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
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
                  <Badge variant={quiz.published ? 'default' : 'secondary'}>
                    {quiz.published ? 'Published' : 'Unpublished'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(quiz.quiz_type === 'assignment' || quiz.quiz_type === 'graded_survey') && quiz.published && (
                    <Button 
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                      onClick={() => handleGradeClick(quiz.id)}
                    >
                      Grade
                    </Button>
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
