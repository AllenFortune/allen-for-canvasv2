
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bot } from 'lucide-react';

interface AIGradeReviewProps {
  gradeReview: string;
  isVisible: boolean;
}

const AIGradeReview: React.FC<AIGradeReviewProps> = ({
  gradeReview,
  isVisible
}) => {
  if (!gradeReview || !isVisible) {
    return null;
  }

  // Split the review into bullet points if it contains line breaks or bullet markers
  const formatReviewContent = (content: string) => {
    if (!content) return [];
    
    // Split by common bullet point markers or line breaks
    const lines = content.split(/\n|•|\.(?=\s[A-Z])|(?<=\.)(?=\s*[•\-\*])/);
    
    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        // Remove common bullet markers from the beginning
        const cleanLine = line.replace(/^[•\-\*]\s*/, '');
        return cleanLine;
      });
  };

  const reviewPoints = formatReviewContent(gradeReview);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm font-medium text-orange-800">
              AI Grade Review
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
            <Eye className="w-3 h-3 mr-1" />
            Teacher Only
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-orange-800 space-y-2">
          <p className="text-xs text-orange-600 italic mb-3">
            Review this summary to verify the AI correctly assessed all parts of the student's submission.
          </p>
          {reviewPoints.length > 1 ? (
            <ul className="space-y-2">
              {reviewPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1 text-xs">•</span>
                  <span className="flex-1">{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{gradeReview}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGradeReview;
