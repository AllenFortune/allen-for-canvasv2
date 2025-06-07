
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { checkSubscription } = useSubscription();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    submissionsAdded?: number;
  } | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !session?.access_token) {
        setVerificationResult({
          success: false,
          message: "Missing payment session information"
        });
        setVerifying(false);
        return;
      }

      try {
        console.log('Verifying payment for session:', sessionId);
        
        const { data, error } = await supabase.functions.invoke('verify-submission-purchase', {
          body: { sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        setVerificationResult(data);
        
        if (data.success) {
          // Refresh subscription data to get updated usage
          await checkSubscription();
          
          toast({
            title: "Payment Successful!",
            description: `${data.submissionsAdded} submissions have been added to your account.`,
          });
        } else {
          toast({
            title: "Payment Verification Failed",
            description: data.message || "Unable to verify your payment",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationResult({
          success: false,
          message: "Failed to verify payment. Please contact support if your payment was processed."
        });
        
        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please refresh the page or contact support.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, session?.access_token, checkSubscription]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-2xl mx-auto px-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {verifying ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                    <p className="text-gray-600">Verifying your payment...</p>
                  </div>
                ) : verificationResult ? (
                  <div className="space-y-4">
                    {verificationResult.success ? (
                      <>
                        <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-green-800 mb-2">
                            Payment Successful!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {verificationResult.message}
                          </p>
                          {verificationResult.submissionsAdded && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <p className="text-green-800 font-medium">
                                +{verificationResult.submissionsAdded} submissions added to your account
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-red-800 mb-2">
                            Verification Issue
                          </h3>
                          <p className="text-gray-600">{verificationResult.message}</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
                    <p className="text-gray-600">No payment session found</p>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Link to="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  {!verifying && !verificationResult?.success && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PaymentSuccess;
