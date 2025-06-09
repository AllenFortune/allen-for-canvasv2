
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, UserX, Calendar, Mail, Search, Download, CreditCard } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

const AdminDashboard = () => {
  const { stats, users, sendCanvasSetupEmail } = useAdminData();
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Trial': return 'secondary';
      case 'Expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'Free Trial': return 'outline';
      case 'Lite Plan': return 'secondary';
      case 'Core Plan': return 'default';
      case 'Full-Time Plan': return 'default';
      case 'Super Plan': return 'default';
      default: return 'outline';
    }
  };

  // Calculate plan distribution
  const planDistribution = users.reduce((acc, user) => {
    acc[user.subscription_tier] = (acc[user.subscription_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSubmissions = users.reduce((sum, user) => sum + user.total_submissions, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canvas Connected</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.canvas_connected || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_users ? Math.round((stats.canvas_connected / stats.total_users) * 100) : 0}% connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Connected</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.canvas_not_connected || 0}</div>
            <p className="text-xs text-muted-foreground">Need setup assistance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.recent_signups || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(planDistribution).map(([plan, count]) => (
              <div key={plan} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{plan}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
              <Button onClick={exportToCSV} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Canvas Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.school_name || 'Not specified'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={getPlanBadgeVariant(user.subscription_tier)}>
                        {user.subscription_tier}
                      </Badge>
                      <div>
                        <Badge variant={getStatusBadgeVariant(user.subscription_status)} className="text-xs">
                          {user.subscription_status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.canvas_connected ? 'default' : 'destructive'}>
                      {user.canvas_connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {user.current_month_submissions}/{user.subscription_limit}
                      </div>
                      <div className="text-muted-foreground">
                        {user.purchased_submissions > 0 && (
                          <span className="text-blue-600">+{user.purchased_submissions} purchased</span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        Last: {user.last_usage_date ? new Date(user.last_usage_date).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {!user.canvas_connected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendCanvasSetupEmail(user.email, user.full_name || user.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Setup Email
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
