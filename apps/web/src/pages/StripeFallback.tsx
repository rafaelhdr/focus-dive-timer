
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '@/config/env';
import { getCommonHeaders } from '@/utils/apiUtils';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';

const StripeFallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processCheckoutResult = async () => {
      if (!sessionId && !canceled) return;
      
      setIsProcessing(true);
      
      if (canceled) {
        setIsSuccess(false);
        toast({
          title: "Checkout Canceled",
          description: "Your payment process was canceled.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (sessionId) {
        try {
          const response = await fetch(`${API_URL}/subscriptions/stripe-fallback`, {
            method: 'POST',
            headers: getCommonHeaders(),
            credentials: 'include',
            body: JSON.stringify({ session_id: sessionId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to process checkout result');
          }
          
          const data = await response.json();
          setIsSuccess(true);
          toast({
            title: "Payment Successful",
            description: "Your subscription has been activated successfully!",
          });
        } catch (error) {
          console.error('Error processing checkout result:', error);
          setIsSuccess(false);
          toast({
            title: "Error",
            description: "Could not verify your payment. Please contact support.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    processCheckoutResult();
  }, [sessionId, canceled, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-6 w-full">
          {isProcessing ? (
            <div className="text-center">
              <div className="animate-pulse text-3xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold mb-2">Processing Your Payment</h1>
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
            </div>
          ) : isSuccess === true ? (
            <div className="p-6 border rounded-lg shadow-sm bg-background w-full">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Your subscription has been activated successfully. Enjoy your premium features!
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          ) : isSuccess === false ? (
            <div className="p-6 border rounded-lg shadow-sm bg-background w-full">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Not Completed</h1>
              <p className="text-muted-foreground mb-6">
                {canceled 
                  ? "Your payment was canceled. You can try again whenever you're ready."
                  : "We couldn't verify your payment. Please contact our support team for assistance."}
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/subscriptions')} className="w-full">
                  Return to Subscriptions
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StripeFallback;
