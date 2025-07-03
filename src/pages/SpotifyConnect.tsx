
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeSpotifyCode } from '@/services/spotifyService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SpotifyConnect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle authorization errors
      if (error) {
        console.error('Spotify authorization error:', error);
        setStatus('error');
        setError('Authorization was denied or cancelled');
        return;
      }

      // Check for required parameters
      if (!code) {
        console.error('No authorization code received from Spotify');
        setStatus('error');
        setError('No authorization code received from Spotify');
        return;
      }

      try {
        // Exchange code for access token
        const result = await exchangeSpotifyCode(code);

        if (result.success) {
          setStatus('success');
          
          // Redirect to integrations page after a short delay
          setTimeout(() => {
            navigate('/integrations/spotify')
          }, 3000);
        } else {
          setStatus('error');
          setError(result.error || 'Failed to connect to Spotify');
        }
      } catch (error) {
        console.error('Error during Spotify connection:', error);
        setStatus('error');
        setError('An unexpected error occurred');
      }
    };

    handleSpotifyCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/integrations/spotify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Spotify Connection</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Connecting your Spotify account...'}
            {status === 'success' && 'Successfully connected to Spotify!'}
            {status === 'error' && 'Connection failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we connect your account...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <AlertDescription>
                  Your Spotify account has been successfully connected to Focus Dive. 
                  You'll be redirected to the integrations page shortly.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              <Button onClick={handleRetry} variant="outline">
                Back to Spotify Integrations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyConnect;
