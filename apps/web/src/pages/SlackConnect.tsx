import { useSlackConnect } from '@/hooks/useSlackConnect';
import { useNavigate } from 'react-router-dom';
import { Button } from "@focusdive/ui";
import { SiSlack } from 'react-icons/si';
import { Home } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const SlackConnect = () => {
  const navigate = useNavigate();
  const { status, message } = useSlackConnect();

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
              onClick={() => navigate('/integrations/slack')}
            >
              <Home className="h-4 w-4" /> 
              Continue to Slack Integration
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
              onClick={() => navigate('/integrations/slack')}
            >
              <SiSlack className="h-4 w-4" /> 
              Return to Slack Integration
            </Button>

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
