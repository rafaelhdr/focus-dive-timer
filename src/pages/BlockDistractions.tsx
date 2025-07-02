
import React, { useState, useEffect } from 'react';
import { SLACK_AUTH_URL } from '@/config/env';
import { checkSlackConnection } from '@/services/slackService';
import { checkSpotifyConnection, disconnectSpotify, getSpotifyAuthUrl } from '@/services/spotifyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Slack, Info, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import SlackConfigForm from '@/components/SlackConfigForm';
import SlackDisconnectDialog from '@/components/SlackDisconnectDialog';
import SlackPermissionsDialog from '@/components/SlackPermissionsDialog';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import SpotifyConfigForm from '@/components/SpotifyConfigForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BlockDistractions = () => {
  const [isSlackConnected, setIsSlackConnected] = useState<boolean | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { auth } = useAuth();

  useEffect(() => {
    const checkConnections = async () => {
      try {
        setIsLoading(true);
        if (auth.isAuthenticated) {
          const [slackConnected, spotifyConnected] = await Promise.all([
            checkSlackConnection(),
            checkSpotifyConnection()
          ]);
          setIsSlackConnected(slackConnected);
          setIsSpotifyConnected(spotifyConnected);
        } else {
          setIsSlackConnected(false);
          setIsSpotifyConnected(false);
        }
      } catch (error) {
        console.error('Error checking connections:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to check integration status.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnections();
  }, [toast, auth.isAuthenticated]);

  const handleSlackConnect = () => {
    window.location.href = SLACK_AUTH_URL;
  };

  const handleSlackDisconnected = () => {
    setIsSlackConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Your Slack account has been disconnected from Focus Dive.',
    });
  };

  const handleSpotifyConnect = async () => {
    try {
      const result = await getSpotifyAuthUrl();
      
      if (result.success && result.url) {
        // Redirect to Spotify authorization
        window.location.href = result.url;
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to get Spotify authorization URL.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error getting Spotify auth URL:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while connecting to Spotify.',
        variant: 'destructive',
      });
    }
  };

  const handleSpotifyDisconnect = async () => {
    try {
      const success = await disconnectSpotify();
      if (success) {
        setIsSpotifyConnected(false);
        toast({
          title: 'Disconnected',
          description: 'Your Spotify account has been disconnected from Focus Dive.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to disconnect your Spotify account.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while disconnecting your Spotify account.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl mx-auto p-4 flex-1">
        <header className="mb-8 text-center relative w-full">
          <div className="absolute right-0 top-0 flex items-center">
            <IntegrationsInfoDialog />
          </div>
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground mb-4">
            Connect your accounts to enhance your focus sessions.
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

        <Tabs defaultValue="slack" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="slack" className="flex items-center gap-2">
              <Slack className="h-4 w-4" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Spotify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slack" className="mt-6">
            <Card>
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
                ) : isSlackConnected ? (
                  <div>
                    <div className="flex items-left justify-between mb-6">
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
                      isConnected={!!isSlackConnected} 
                      isAuthenticated={auth.isAuthenticated}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-left py-4 mb-8">
                      <p className="mb-4">Connect your Slack account to enable automatic status updates.</p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSlackConnect} 
                          className="gap-2" 
                          disabled={!auth.isAuthenticated}
                        >
                          <Slack className="h-4 w-4" />
                          Connect to Slack
                        </Button>
                        <SlackPermissionsDialog />
                      </div>
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
          </TabsContent>

          <TabsContent value="spotify" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Spotify Integration
                </CardTitle>
                <CardDescription>
                  Control your music playback during focus sessions. Pause music during breaks and resume during focus time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : isSpotifyConnected ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 flex-1 mr-4">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertTitle>Connected to Spotify</AlertTitle>
                        <AlertDescription>
                          Your Spotify account is connected and ready to use with Focus Dive.
                        </AlertDescription>
                      </Alert>
                      
                      {auth.isAuthenticated && (
                        <Button 
                          variant="outline" 
                          onClick={handleSpotifyDisconnect}
                          className="text-destructive hover:text-destructive"
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>
                    
                    {/* Spotify Player Component */}
                    {auth.isAuthenticated && <SpotifyPlayer />}
                    
                    {/* Spotify Configuration Form */}
                    {auth.isAuthenticated && (
                      <SpotifyConfigForm 
                        isConnected={!!isSpotifyConnected} 
                        isAuthenticated={auth.isAuthenticated}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-left py-4">
                    <p className="mb-4">Connect your Spotify account to control music during focus sessions.</p>
                    <Button 
                      onClick={handleSpotifyConnect} 
                      className="gap-2" 
                      disabled={!auth.isAuthenticated}
                    >
                      <Music className="h-4 w-4" />
                      Connect to Spotify
                    </Button>
                    {!auth.isAuthenticated && (
                      <p className="text-sm text-muted-foreground mt-3">
                        Please login to enable this integration
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlockDistractions;
