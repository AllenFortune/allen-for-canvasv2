
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, UserX, Calendar, Mail, Search, Download } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

const AdminDashboard = () => {
  const { stats, users, sendCanvasSetupEmail } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConnected, setFilterConnected] = useState<'all' | 'connected' | 'not_connected'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.school_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterConnected === 'all' ||
                         (filterConnected === 'connected' && user.canvas_connected) ||
                         (filterConnected === 'not_connected' && !user.canvas_connected);
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Email', 'Full Name', 'School', 'Canvas Connected', 'Created At', 'Last Usage', 'Total Submissions'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.school_name || '',
        user.canvas_connected ? 'Yes' : 'No',
        new Date(user.created_at).toLocaleDateString(),
        user.last_usage_date ? new Date(user.last_usage_date).toLocaleDateString() : 'Never',
        user.total_submissions
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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.recent_signups || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

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
            <div className="flex gap-2">
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
                    <Badge variant={user.canvas_connected ? 'default' : 'destructive'}>
                      {user.canvas_connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.total_submissions} submissions</div>
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
