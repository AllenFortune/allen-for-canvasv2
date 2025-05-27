
import React from 'react';

type SortOrder = 'oldest-first' | 'newest-first';

interface AssignmentsSummaryProps {
  assignmentCount: number;
  sortOrder: SortOrder;
}

const AssignmentsSummary: React.FC<AssignmentsSummaryProps> = ({ assignmentCount, sortOrder }) => {
  if (assignmentCount === 0) return null;

  return (
    <div className="mt-8 text-center text-sm text-gray-500">
      Showing {assignmentCount} assignments that need grading, sorted by{' '}
      {sortOrder === 'oldest-first' ? 'oldest first' : 'newest first'}
      {sortOrder === 'oldest-first' && (
        <span className="block mt-1">Assignments without due dates are shown last</span>
      )}
    </div>
  );
};

export default AssignmentsSummary;
