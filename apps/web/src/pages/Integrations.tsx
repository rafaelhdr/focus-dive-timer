import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { slackAuthUrl } from '@focusdive/config';
import { checkSlackConnection } from '@/services/slackService';
import { fetchUserSubscriptionData } from '@/services/userApi';
import { Button } from "@focusdive/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info } from 'lucide-react';
import { SiSlack } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useMe } from '@focusdive/auth';
import { Link } from 'react-router-dom';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import SlackConfigForm from '@/components/SlackConfigForm';
import SlackDisconnectDialog from '@/components/SlackDisconnectDialog';
import SlackPermissionsDialog from '@/components/SlackPermissionsDialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const Integrations = () => {
  const navigate = useNavigate();
  const [isSlackConnected, setIsSlackConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { data: user } = useMe();

  const getActiveTab = () => {
    return 'slack'; // Default to slack for /integrations and /integrations/slack
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const checkConnections = async () => {
      try {
        setIsLoading(true);
        if (user) {
          const [slackConnected] = await Promise.all([
            checkSlackConnection(),
            fetchUserSubscriptionData()
          ]);
          setIsSlackConnected(slackConnected);
        } else {
          setIsSlackConnected(false);
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
  }, [toast, user]);

  const handleTabChange = (value: string) => {
    if (value === 'slack') {
      navigate('/integrations/slack');
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

        {!user && (
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
                    
                    
                    {user && (
                      <div className="flex justify-end mb-4">
                        <SlackDisconnectDialog onDisconnected={handleSlackDisconnected} />
                      </div>
                    )}
                    
                    <SlackConfigForm 
                      isConnected={!!isSlackConnected} 
                      isAuthenticated={!!user}
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
                          disabled={!user}
                        >
                          <SiSlack className="h-4 w-4" />
                          Connect to Slack
                        </Button>
                        <SlackPermissionsDialog />
                      </div>
                      {!user && (
                        <p className="text-sm text-muted-foreground mt-3">
                          Please login to enable this integration
                        </p>
                      )}
                    </div>
                    
                    {/* Always show the SlackConfigForm, but it will be disabled if not authenticated */}
                    <SlackConfigForm 
                      isConnected={false} 
                      isAuthenticated={!!user}
                    />
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
