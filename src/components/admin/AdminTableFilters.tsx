
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AdminTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterConnected: 'all' | 'connected' | 'not_connected';
  setFilterConnected: (filter: 'all' | 'connected' | 'not_connected') => void;
  filterPlan: 'all' | 'trial' | 'lite' | 'core' | 'fulltime';
  setFilterPlan: (filter: 'all' | 'trial' | 'lite' | 'core' | 'fulltime') => void;
  onExport: () => void;
}

const AdminTableFilters = ({
  searchTerm,
  setSearchTerm,
  filterConnected,
  setFilterConnected,
  filterPlan,
  setFilterPlan,
  onExport
}: AdminTableFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="md:max-w-sm"
      />
      
      <Select value={filterConnected} onValueChange={setFilterConnected}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue placeholder="Canvas Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="connected">Connected</SelectItem>
          <SelectItem value="not_connected">Not Connected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterPlan} onValueChange={setFilterPlan}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue placeholder="Plan Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          <SelectItem value="trial">Free Trial</SelectItem>
          <SelectItem value="lite">Lite Plan</SelectItem>
          <SelectItem value="core">Core Plan</SelectItem>
          <SelectItem value="fulltime">Full-Time Plan</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onExport} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
};

export default AdminTableFilters;
