
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
          Why do I need permission?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Spotify Integration Requirements</DialogTitle>
          <DialogDescription>
            Understanding Spotify's developer terms and our current limitations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Spotify Developer Terms</h3>
            <p className="text-sm text-muted-foreground mb-3">
              According to Spotify's Web API documentation, apps need to meet specific requirements 
              to access their services at scale. Focus Dive currently falls under Spotify's quota 
              mode restrictions, which require apps to have 250,000+ Monthly Active Users (MAU) 
              for unrestricted access.
            </p>
            <p className="text-sm text-muted-foreground">
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
            <h3 className="font-semibold mb-2">Current Process</h3>
            <p className="text-sm text-muted-foreground">
              Due to these policies, we need to manually add your email address to our Spotify 
              developer account's allowlist before you can use the integration. This is a temporary 
              measure while we work towards meeting Spotify's requirements.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Alternative Solutions</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We're actively working on integrating alternative music services to provide you 
              with more options. Some alternatives we're considering include:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Apple Music</li>
              <li>YouTube Music</li>
              <li>SoundCloud</li>
              <li>Deezer</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Have a suggestion for a music service you'd like to see integrated? 
              Let us know through our support channels!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpotifyRequestModal;
