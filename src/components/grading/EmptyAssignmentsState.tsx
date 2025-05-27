
import React from 'react';
import { Calendar } from 'lucide-react';

const EmptyAssignmentsState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">No assignments need grading at this time.</p>
      <p className="text-gray-500 text-sm mt-2">Check back later or refresh to see new submissions.</p>
    </div>
  );
};

export default EmptyAssignmentsState;
