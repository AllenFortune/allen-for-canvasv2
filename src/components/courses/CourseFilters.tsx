
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter } from 'lucide-react';

interface CourseFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  filter,
  setFilter,
  onRefresh,
  refreshing
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-600" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={onRefresh} 
        disabled={refreshing}
        className="bg-gray-900 hover:bg-gray-800"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh Courses
      </Button>
    </div>
  );
};

export default CourseFilters;
