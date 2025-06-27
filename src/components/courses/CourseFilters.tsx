
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter, Info, AlertCircle } from 'lucide-react';

interface CourseFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  error?: string | null;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  filter,
  setFilter,
  onRefresh,
  refreshing,
  error
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="past">Past Courses</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
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
          {refreshing ? 'Refreshing...' : 'Refresh Courses'}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {filter === 'favorites' && !error && (
        <div className="flex items-start gap-2 text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Canvas Favorites</p>
            <p>Favorites are managed in your Canvas LMS. Use the star icon next to courses in Canvas to add them to favorites.</p>
          </div>
        </div>
      )}
      
      {filter === 'past' && !error && (
        <div className="flex items-start gap-2 text-gray-600 text-sm bg-amber-50 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Past Courses</p>
            <p>These are courses that have ended or concluded. Some grading features may be limited for past courses.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;
