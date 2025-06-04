
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Bot } from 'lucide-react';
import { DiscussionGrade } from '@/types/grading';

interface PreviousFeedbackSectionProps {
  currentGrade: DiscussionGrade;
  maxPoints: number;
}

const PreviousFeedbackSection: React.FC<PreviousFeedbackSectionProps> = ({ 
  currentGrade, 
  maxPoints 
}) => {
  if (!currentGrade || (!currentGrade.grade && !currentGrade.feedback && !currentGrade.ai_grade_review)) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Award className="w-5 h-5" />
          Previous Grade & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentGrade.grade && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Grade: {currentGrade.score || currentGrade.grade}/{maxPoints}
            </Badge>
          </div>
        )}

        {currentGrade.feedback && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm">Instructor Feedback</span>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-gray-700">{currentGrade.feedback}</p>
            </div>
          </div>
        )}

        {currentGrade.ai_grade_review && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm">AI Review</span>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-gray-700">{currentGrade.ai_grade_review}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviousFeedbackSection;
