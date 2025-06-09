
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

interface AdminTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterConnected: 'all' | 'connected' | 'not_connected';
  setFilterConnected: (filter: 'all' | 'connected' | 'not_connected') => void;
  filterPlan: 'all' | 'trial' | 'lite' | 'core' | 'fulltime' | 'super';
  setFilterPlan: (filter: 'all' | 'trial' | 'lite' | 'core' | 'fulltime' | 'super') => void;
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
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterConnected === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterConnected('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filterConnected === 'connected' ? 'default' : 'outline'}
          onClick={() => setFilterConnected('connected')}
          size="sm"
        >
          Connected
        </Button>
        <Button
          variant={filterConnected === 'not_connected' ? 'default' : 'outline'}
          onClick={() => setFilterConnected('not_connected')}
          size="sm"
        >
          Not Connected
        </Button>
        <Button
          variant={filterPlan === 'trial' ? 'default' : 'outline'}
          onClick={() => setFilterPlan('trial')}
          size="sm"
        >
          Trial
        </Button>
        <Button
          variant={filterPlan === 'lite' ? 'default' : 'outline'}
          onClick={() => setFilterPlan('lite')}
          size="sm"
        >
          Lite
        </Button>
        <Button
          variant={filterPlan === 'core' ? 'default' : 'outline'}
          onClick={() => setFilterPlan('core')}
          size="sm"
        >
          Core
        </Button>
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default AdminTableFilters;
