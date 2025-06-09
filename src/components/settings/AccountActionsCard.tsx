
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AccountActionsCardProps {
  onSignOut: () => Promise<void>;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({ onSignOut }) => {
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Signed out",
        description: "You have been logged out of your account.",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountActionsCard;
