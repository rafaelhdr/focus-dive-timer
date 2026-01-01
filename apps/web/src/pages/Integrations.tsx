import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { slackAuthUrl } from '@focusdive/config';
import { checkSlackConnection } from '@/services/slackService';
import { checkSpotifyConnection, disconnectSpotify, getSpotifyAuthUrl } from '@/services/spotifyService';
import { fetchUserSubscriptionData, requestSpotifyAccess } from '@/services/userApi';
import { Button } from "@focusdive/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, Loader2, Clock, Unlink } from 'lucide-react';
import { SiSlack, SiSpotify } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import SlackConfigForm from '@/components/SlackConfigForm';
import SlackDisconnectDialog from '@/components/SlackDisconnectDialog';
import SlackPermissionsDialog from '@/components/SlackPermissionsDialog';
import SpotifyConfigForm from '@/components/SpotifyConfigForm';
import SpotifyRequestModal from '@/components/SpotifyRequestModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Integrations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSlackConnected, setIsSlackConnected] = useState<boolean | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean | null>(null);
  const [isSpotifyApproved, setIsSpotifyApproved] = useState<boolean | null>(null);
  const [isSpotifyAccessRequested, setIsSpotifyAccessRequested] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const { toast } = useToast();
  const { auth } = useAuth();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === '/integrations/spotify') return 'spotify';
    return 'slack'; // Default to slack for /integrations and /integrations/slack
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const checkConnections = async () => {
      try {
        setIsLoading(true);
        if (auth.isAuthenticated) {
          const [slackConnected, spotifyConnected, userData] = await Promise.all([
            checkSlackConnection(),
            checkSpotifyConnection(),
            fetchUserSubscriptionData()
          ]);
          setIsSlackConnected(slackConnected);
          setIsSpotifyConnected(spotifyConnected);
          setIsSpotifyApproved(userData?.spotify_approved || false);
          setIsSpotifyAccessRequested(userData?.spotify_access_requested || false);
        } else {
          setIsSlackConnected(false);
          setIsSpotifyConnected(false);
          setIsSpotifyApproved(false);
          setIsSpotifyAccessRequested(false);
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

  const handleTabChange = (value: string) => {
    if (value === 'slack') {
      navigate('/integrations/slack');
    } else if (value === 'spotify') {
      navigate('/integrations/spotify');
    }
  };

  const handleSlackConnect = () => {
    window.location.href = slackAuthUrl;
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

  const handleRequestSpotifyAccess = async () => {
    setIsRequestingAccess(true);
    try {
      const result = await requestSpotifyAccess();
      
      if (result.success) {
        setIsSpotifyAccessRequested(true);
        toast({
          title: 'Request Submitted',
          description: result.message || 'Your Spotify access request has been submitted. We\'ll review it and get back to you soon.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit Spotify access request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting Spotify access:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while submitting your request.',
        variant: 'destructive',
      });
    } finally {
      setIsRequestingAccess(false);
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="slack" className="flex items-center gap-2">
              <SiSlack className="h-4 w-4" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <SiSpotify className="h-4 w-4" />
              Spotify
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slack" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SiSlack className="h-5 w-5" />
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
                    <div className="space-y-4 mb-6">
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertTitle>Connected to Slack</AlertTitle>
                        <AlertDescription>
                          Your Slack account is connected and ready to use with Focus Dive.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    
                    {auth.isAuthenticated && (
                      <div className="flex justify-end mb-4">
                        <SlackDisconnectDialog onDisconnected={handleSlackDisconnected} />
                      </div>
                    )}
                    
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
                          <SiSlack className="h-4 w-4" />
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
                  <SiSpotify className="h-5 w-5" />
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
                ) : !isSpotifyApproved ? (
                  <div className="space-y-4">
                    {isSpotifyAccessRequested && (
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <AlertTitle>Request Submitted</AlertTitle>
                        <AlertDescription>
                          Your Spotify access request has been submitted and is waiting for review. We'll get back to you soon!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button 
                        onClick={handleRequestSpotifyAccess}
                        disabled={!auth.isAuthenticated || isRequestingAccess || isSpotifyAccessRequested}
                        className="gap-2"
                      >
                        {isRequestingAccess ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Requesting...
                          </>
                        ) : isSpotifyAccessRequested ? (
                          <>
                            <Clock className="h-4 w-4" />
                            Request Submitted - Waiting for Review
                          </>
                          ) : (
                            <>
                              <SiSpotify className="h-4 w-4" />
                              Request Spotify Access
                            </>
                          )}
                      </Button>
                      <SpotifyRequestModal />
                    </div>
                    
                    {!auth.isAuthenticated && (
                      <p className="text-sm text-muted-foreground">
                        Please login to request Spotify access
                      </p>
                    )}
                  </div>
                ) : isSpotifyConnected ? (
                  <div>
                    <div className="space-y-4 mb-6">
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertTitle>Connected to Spotify</AlertTitle>
                        <AlertDescription>
                          Your Spotify account is connected and ready to use with Focus Dive.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    
                    {auth.isAuthenticated && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          variant="outline" 
                          onClick={handleSpotifyDisconnect}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Unlink className="h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    )}
                    
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
                      <SiSpotify className="h-4 w-4" />
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

export default Integrations;
