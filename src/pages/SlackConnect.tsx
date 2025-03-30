
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SlackConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Process the OAuth response
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const code = url.searchParams.get('code');

    if (error) {
      console.error('Slack OAuth error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Slack. Please try again.',
        variant: 'destructive',
      });
      navigate('/block-distractions');
      return;
    }

    if (code) {
      // In a real implementation, we would send this code to our backend
      // to exchange it for an access token and save it.
      // For this example, we'll just show a success message
      toast({
        title: 'Connected Successfully',
        description: 'Your Slack account has been connected!',
      });
    }

    // Redirect back to the block-distractions page
    navigate('/block-distractions');
  }, [navigate, toast]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Connecting to Slack...</h1>
        <p className="text-muted-foreground">Please wait while we complete the process.</p>
      </div>
    </div>
  );
};

export default SlackConnect;
