import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, FileText, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: number;
  title: string;
  description: string;
  points_possible: number;
  time_limit: number;
  allowed_attempts: number;
  quiz_type: string;
}

interface QuizQuestion {
  id: number;
  question_type: string;
  points_possible: number;
}

interface QuizSubmission {
  id: number;
  workflow_state: string;
  score: number | null;
}

interface EnhancedQuizHeaderProps {
  courseId: string;
  quiz: Quiz | null;
  submissions: QuizSubmission[];
  questions: QuizQuestion[];
  onRefreshSubmissions?: () => Promise<boolean>;
}

const EnhancedQuizHeader: React.FC<EnhancedQuizHeaderProps> = ({
  courseId,
  quiz,
  submissions,
  questions,
  onRefreshSubmissions
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  if (!quiz) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const manualGradingQuestions = questions.filter(q => 
    q.question_type === 'essay_question' || 
    q.question_type === 'fill_in_multiple_blanks_question' ||
    q.question_type === 'file_upload_question'
  );

  const needsGradingCount = submissions.filter(s => 
    s.workflow_state === 'complete' || s.workflow_state === 'pending_review'
  ).length;

  const gradedCount = submissions.filter(s => 
    s.workflow_state === 'graded' && s.score !== null
  ).length;

  const handleRefreshSubmissions = async () => {
    if (!onRefreshSubmissions) return;
    
    setIsRefreshing(true);
    try {
      const success = await onRefreshSubmissions();
      if (success) {
        toast({
          title: "Status Updated",
          description: "Submission statuses refreshed from Canvas",
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: "Could not refresh submission statuses from Canvas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: "An error occurred while refreshing statuses",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Back Navigation Button */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to={`/courses/${courseId}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>
          </Button>
          
          {onRefreshSubmissions && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSubmissions}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <Badge variant="outline" className="text-sm">
                {quiz.quiz_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{quiz.points_possible} points</span>
              </div>
              
              {quiz.time_limit && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.time_limit} minutes</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{submissions.length} submissions</span>
              </div>

              {manualGradingQuestions.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{manualGradingQuestions.length} manual grading questions</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Needs Grading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{needsGradingCount}</div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Graded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{gradedCount}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {quiz.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div 
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: quiz.description }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuizHeader;
