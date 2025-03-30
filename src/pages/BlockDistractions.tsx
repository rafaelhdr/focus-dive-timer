
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SLACK_AUTH_URL } from '@/config/env';
import { checkSlackConnection } from '@/services/slackService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Slack } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BlockDistractions = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const connected = await checkSlackConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error('Error checking Slack connection:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to check Slack connection status.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [toast]);

  const handleSlackConnect = () => {
    window.location.href = SLACK_AUTH_URL;
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Block Distractions</h1>
      <p className="text-muted-foreground mb-8">
        Connect your Slack account to automatically update your status during focus sessions.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            When you start a focus session, we'll update your Slack status to let your team know you're focusing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isConnected ? (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle>Connected to Slack</AlertTitle>
              <AlertDescription>
                Your Slack account is connected and ready to use with Focus Dive.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">Connect your Slack account to enable automatic status updates.</p>
              <Button onClick={handleSlackConnect} className="gap-2">
                <Slack className="h-4 w-4" />
                Connect to Slack
              </Button>
            </div>
          )}
        </CardContent>
        {isConnected && (
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Back to Settings
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BlockDistractions;
