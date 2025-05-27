
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

type SortOrder = 'oldest-first' | 'newest-first';

interface AssignmentsHeaderProps {
  assignmentCount: number;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const AssignmentsHeader: React.FC<AssignmentsHeaderProps> = ({
  assignmentCount,
  sortOrder,
  setSortOrder,
  onRefresh,
  refreshing
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Needs Grading</h1>
        <p className="text-xl text-gray-600">
          {assignmentCount} assignments need grading across all courses
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest-first">Oldest First</SelectItem>
            <SelectItem value="newest-first">Newest First</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={onRefresh} 
          disabled={refreshing}
          className="bg-gray-900 hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default AssignmentsHeader;
