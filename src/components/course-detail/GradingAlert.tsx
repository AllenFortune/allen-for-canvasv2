
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GradingAlertProps {
  totalNeedsGrading: number;
}

const GradingAlert: React.FC<GradingAlertProps> = ({ totalNeedsGrading }) => {
  console.log('GradingAlert received totalNeedsGrading:', totalNeedsGrading);
  
  if (totalNeedsGrading === 0) return null;

  return (
    <div className="mb-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <p className="text-orange-800">
            You have <strong>{totalNeedsGrading}</strong> {totalNeedsGrading === 1 ? 'item' : 'items'} that need grading in this course.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GradingAlert;
