
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useReferrals } from '@/hooks/useReferrals';
import { Users, Gift, Share2, Copy, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReferralDashboard: React.FC = () => {
  const { stats, referrals, loading, sendInvitations, getReferralUrl, manualGenerateCode } = useReferrals();
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopyLink = () => {
    const url = getReferralUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleSendInvitations = async () => {
    const emails = emailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const success = await sendInvitations(emails, message);
    if (success) {
      setEmailInput('');
      setMessage('');
    }
    setSending(false);
  };

  const handleManualGenerate = async () => {
    setGenerating(true);
    await manualGenerateCode();
    setGenerating(false);
  };

  const getStatusBadge = (status: string, canvasConnected: boolean) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending Signup</Badge>;
      case 'completed':
        return canvasConnected 
          ? <Badge variant="default">Canvas Connected</Badge>
          : <Badge variant="secondary">Needs Canvas</Badge>;
      case 'rewarded':
        return <Badge variant="default" className="bg-green-600">Rewards Granted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Gift className="w-4 h-4" />
          <span>Earn 10 submissions per successful referral</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completed_referrals || 0} completed, {stats?.pending_referrals || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_rewards_earned || 0}</div>
            <p className="text-xs text-muted-foreground">
              Free submissions earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {stats?.referral_code || 'Not generated'}
            </div>
            <div className="flex gap-2 mt-2">
              {stats?.referral_code ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyLink}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Link
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualGenerate}
                  disabled={generating}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
                  Generate Code
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Show invitation form only if referral code exists */}
      {stats?.referral_code && (
        <Card>
          <CardHeader>
            <CardTitle>Send Invitations</CardTitle>
            <p className="text-sm text-gray-600">
              Invite friends and colleagues to try Allen. When they sign up and connect Canvas, you both get 10 free submissions!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Addresses</label>
              <Input
                placeholder="Enter email addresses separated by commas"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: colleague1@school.edu, colleague2@school.edu
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Personal Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSendInvitations}
              disabled={sending || !emailInput.trim()}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Send Invitations'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Start inviting friends!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div 
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{referral.referee_email || 'Pending signup'}</p>
                    <p className="text-sm text-gray-500">
                      Invited on {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(referral.status, !!referral.canvas_connected_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Options - only show if referral code exists */}
      {stats?.referral_code && (
        <Card>
          <CardHeader>
            <CardTitle>Share Your Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
              <Input 
                value={getReferralUrl()} 
                readOnly 
                className="bg-white"
              />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  const url = getReferralUrl();
                  const text = `Check out Allen - an AI-powered Canvas grading assistant that helps teachers grade faster! ${url}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share on Twitter
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const url = getReferralUrl();
                  const subject = 'Try Allen - AI Canvas Grading Assistant';
                  const body = `I've been using Allen to help with grading my Canvas assignments and it's been amazing! It uses AI to provide consistent, helpful feedback to students while saving me tons of time.\n\nYou can try it here: ${url}\n\nWhen you sign up and connect your Canvas account, we both get 10 free submissions to try it out!`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralDashboard;
