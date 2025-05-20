
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/env';
import { getCommonHeaders } from '@/utils/apiUtils';

const StripeFallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'canceled' | 'processing'>('processing');
  
  const queryParams = new URLSearchParams(location.search);
  const isSuccess = queryParams.get('success') === 'true';
  const isCanceled = queryParams.get('canceled') === 'true';
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    // If canceled is true, show the error page
    if (isCanceled) {
      setStatus('canceled');
      setIsLoading(false);
      return;
    }

    // If we have a success flag and session ID, verify it with the backend
    if (isSuccess && sessionId) {
      verifySession();
    } else {
      // Invalid parameters
      setStatus('canceled');
      setIsLoading(false);
    }
  }, [isSuccess, isCanceled, sessionId]);

  const verifySession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/subscriptions/stripe-fallback`, {
        method: 'POST',
        headers: getCommonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify session');
      }

      // If we get here, the session was verified successfully
      setStatus('success');
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated. Thank you!",
      });
    } catch (error) {
      console.error('Error verifying session:', error);
      setStatus('canceled');
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-3xl mx-auto pt-20 px-4 pb-16">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLoading ? (
                "Processing Payment"
              ) : status === 'success' ? (
                "Payment Successful!"
              ) : (
                "Payment Unsuccessful"
              )}
            </CardTitle>
            <CardDescription>
              {isLoading ? (
                "Please wait while we verify your payment..."
              ) : status === 'success' ? (
                "Thank you for your subscription!"
              ) : (
                "Your payment was canceled or could not be processed."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p>Verifying your payment...</p>
              </div>
            ) : status === 'success' ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg">Your premium features are now active!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-lg">Payment was not completed.</p>
                <p className="mt-2 text-muted-foreground">
                  You have not been charged. Please try again or contact support if you continue to experience issues.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
            >
              Go to Home
            </Button>
            {status === 'canceled' && (
              <Button
                onClick={() => navigate('/subscriptions')}
              >
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StripeFallback;
