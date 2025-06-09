
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail } from 'lucide-react';

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

interface AdminUserTableProps {
  users: AdminUser[];
  onSendCanvasSetupEmail: (userEmail: string, userName: string) => void;
}

const AdminUserTable = ({ users, onSendCanvasSetupEmail }: AdminUserTableProps) => {
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

  return (
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
        {users.map((user) => (
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
                  onClick={() => onSendCanvasSetupEmail(user.email, user.full_name || user.email)}
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
  );
};

export default AdminUserTable;
