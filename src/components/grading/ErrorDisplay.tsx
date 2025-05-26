
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-600">{error}</p>
      <button 
        onClick={onRetry}
        className="mt-2 text-sm text-red-700 underline"
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorDisplay;
