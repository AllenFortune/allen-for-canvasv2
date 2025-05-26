
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          Error Loading Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-y-2 text-sm text-red-700">
          <p><strong>Common solutions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if your Canvas credentials are properly configured</li>
            <li>Verify you have permission to view this assignment</li>
            <li>Ensure you're connected to the internet</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
        <Button 
          onClick={onRetry}
          variant="outline"
          className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
