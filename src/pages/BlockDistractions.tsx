
import React, { useState, useEffect } from 'react';
import { SLACK_AUTH_URL } from '@/config/env';
import { checkSlackConnection } from '@/services/slackService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Slack, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import SlackConfigForm from '@/components/SlackConfigForm';
import SlackDisconnectDialog from '@/components/SlackDisconnectDialog';

const BlockDistractions = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { auth } = useAuth();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        if (auth.isAuthenticated) {
          const connected = await checkSlackConnection();
          setIsConnected(connected);
        } else {
          setIsConnected(false);
        }
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
  }, [toast, auth.isAuthenticated]);

  const handleSlackConnect = () => {
    window.location.href = SLACK_AUTH_URL;
  };

  const handleSlackDisconnected = () => {
    setIsConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Your Slack account has been disconnected from Focus Dive.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl">
        <header className="mb-8 text-center relative w-full">
          <div className="absolute right-0 top-0 flex items-center">
            <IntegrationsInfoDialog />
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold mb-2">Block Distractions</h1>
          <p className="text-muted-foreground mb-4">
            Connect your Slack account to automatically update your status during focus sessions.
          </p>
        </header>

        {!auth.isAuthenticated && (
          <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>You need to be logged in to use the integrations.</p>
              <Link to="/login" className="self-start">
                <Button size="sm" variant="outline" className="mt-1">
                  Go to Login
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

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
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 flex-1 mr-4">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle>Connected to Slack</AlertTitle>
                    <AlertDescription>
                      Your Slack account is connected and ready to use with Focus Dive.
                    </AlertDescription>
                  </Alert>
                  
                  {auth.isAuthenticated && (
                    <SlackDisconnectDialog onDisconnected={handleSlackDisconnected} />
                  )}
                </div>
                
                <SlackConfigForm 
                  isConnected={!!isConnected} 
                  isAuthenticated={auth.isAuthenticated}
                />
              </div>
            ) : (
              <div>
                <div className="text-center py-4 mb-8">
                  <p className="mb-4">Connect your Slack account to enable automatic status updates.</p>
                  <Button 
                    onClick={handleSlackConnect} 
                    className="gap-2" 
                    disabled={!auth.isAuthenticated}
                  >
                    <Slack className="h-4 w-4" />
                    Connect to Slack
                  </Button>
                  {!auth.isAuthenticated && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Please login to enable this integration
                    </p>
                  )}
                </div>
                
                {/* Always show the SlackConfigForm, but it will be disabled if not authenticated */}
                <SlackConfigForm 
                  isConnected={false} 
                  isAuthenticated={auth.isAuthenticated}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlockDistractions;
