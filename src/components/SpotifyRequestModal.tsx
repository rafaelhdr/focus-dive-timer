
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info } from 'lucide-react';

const SpotifyRequestModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Why this request?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Spotify Integration Requirements</DialogTitle>
          <DialogDescription>
            Due to Spotify's developer restrictions, we need to <strong><u>manually add your email</u></strong> before you can use the Spotify integration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Spotify only allows public access for apps with <strong><u>250,000+ active users</u></strong> — and we're not there.
              You can read more about these requirements in their{' '}
              <a 
                href="https://developer.spotify.com/documentation/web-api/concepts/quota-modes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                official documentation
              </a>.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Alternative Solutions</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Have a suggestion for a music service you'd like to see integrated? Let us know through our support e-mail:
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <a 
                href="mailto:support@focusdive.app" 
                className="text-primary hover:underline"
              >
                support@focusdive.app
              </a>{' '}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpotifyRequestModal;
