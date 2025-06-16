
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccountActionsCardProps {
  onSignOut: () => Promise<void>;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({ onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await onSignOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountActionsCard;
