
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminTableFilters from './AdminTableFilters';
import AdminUserTable from './AdminUserTable';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  school_name: string;
  canvas_connected: boolean;
  created_at: string;
  last_usage_date: string;
  total_submissions: number;
  subscription_tier: string;
  subscription_status: string;
  current_month_submissions: number;
  purchased_submissions: number;
  subscription_limit: number;
}

interface AdminUserManagementProps {
  users: AdminUser[];
  onSendCanvasSetupEmail: (userEmail: string, userName: string) => void;
}

const AdminUserManagement = ({ users, onSendCanvasSetupEmail }: AdminUserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConnected, setFilterConnected] = useState<'all' | 'connected' | 'not_connected'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'trial' | 'lite' | 'core' | 'fulltime' | 'super'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.school_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConnectionFilter = filterConnected === 'all' ||
                         (filterConnected === 'connected' && user.canvas_connected) ||
                         (filterConnected === 'not_connected' && !user.canvas_connected);
    
    const matchesPlanFilter = filterPlan === 'all' ||
                             (filterPlan === 'trial' && user.subscription_tier === 'Free Trial') ||
                             (filterPlan === 'lite' && user.subscription_tier === 'Lite Plan') ||
                             (filterPlan === 'core' && user.subscription_tier === 'Core Plan') ||
                             (filterPlan === 'fulltime' && user.subscription_tier === 'Full-Time Plan') ||
                             (filterPlan === 'super' && user.subscription_tier === 'Super Plan');
    
    return matchesSearch && matchesConnectionFilter && matchesPlanFilter;
  });

  const exportToCSV = () => {
    const headers = ['Email', 'Full Name', 'School', 'Canvas Connected', 'Plan', 'Status', 'Current Usage', 'Total Submissions', 'Created At', 'Last Usage'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.school_name || '',
        user.canvas_connected ? 'Yes' : 'No',
        user.subscription_tier,
        user.subscription_status,
        `${user.current_month_submissions}/${user.subscription_limit}`,
        user.total_submissions,
        new Date(user.created_at).toLocaleDateString(),
        user.last_usage_date ? new Date(user.last_usage_date).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <AdminTableFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterConnected={filterConnected}
          setFilterConnected={setFilterConnected}
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
          onExport={exportToCSV}
        />
      </CardHeader>
      <CardContent>
        <AdminUserTable 
          users={filteredUsers} 
          onSendCanvasSetupEmail={onSendCanvasSetupEmail} 
        />
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
