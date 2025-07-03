
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { getCommonHeaders } from '@/utils/apiUtils';

const SlackConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { auth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Slack...');

  useEffect(() => {
    const connectToSlack = async () => {
      try {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          console.error('Slack OAuth error:', error);
          setStatus('error');
          setMessage('Failed to connect to Slack.');
          toast({
            title: 'Connection Failed',
            description: 'Failed to connect to Slack. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code provided.');
          return;
        }

        // Send the code to our backend with proper headers
        const response = await fetch(`${API_URL}/slack/connect`, {
          method: 'POST',
          headers: getCommonHeaders(),
          body: JSON.stringify({ code }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to Slack: ${response.statusText}`);
        }

        setStatus('success');
        setMessage('Successfully connected to Slack!');
        toast({
          title: 'Success',
          description: 'Connected to Slack successfully!',
        });
      } catch (error) {
        console.error('Error connecting to Slack:', error);
        setStatus('error');
        setMessage('An error occurred while connecting to Slack.');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to Slack. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    connectToSlack();
  }, [toast, auth.accessToken]);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h1 className="text-2xl font-bold">{message}</h1>
            <p className="text-muted-foreground">Please wait while we complete the process.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertTitle className="text-xl font-bold text-green-700 dark:text-green-400">
                {message}
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-500">
                You can now use Slack integration features to help you focus on your work.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="gap-2" 
              size="lg" 
              onClick={() => navigate('/integrations/spotify')}
            >
              <Home className="h-4 w-4" /> 
              Continue to Spotify Integration
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTitle className="text-xl font-bold">{message}</AlertTitle>
              <AlertDescription>
                There was a problem connecting your Slack account. Please try again later.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="gap-2" 
              size="lg" 
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" /> 
              Return to Timer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlackConnect;
