
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccountActionsCardProps {
  onSignOut: () => Promise<void>;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({ onSignOut }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onSignOut}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountActionsCard;
