
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const Footer: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-background py-6 mt-auto">
      <div className="container max-w-4xl mx-auto flex justify-center items-center gap-6 text-sm text-muted-foreground">
        <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Privacy Policy</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
                <p className="font-medium">Effective date: 2025-06-03</p>
                
                <p>At FocusDive, we value your privacy and collect as little data as possible.</p>
                
                <div>
                  <h3 className="font-semibold mb-2">What We Collect</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We only collect your email address, and only when you sign up.</li>
                    <li>We do not sell, share, or use your email for marketing.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Third-Party Services</h3>
                  <p className="mb-2">We use the following services to provide functionality:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Slack:</strong> Used to update your focus status automatically.{' '}
                      <a 
                        href="https://slack.com/privacy-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        See Slack's Privacy Policy.
                      </a>
                    </li>
                    <li>
                      <strong>Stripe:</strong> Used to handle secure payments.{' '}
                      <a 
                        href="https://stripe.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        See Stripe's Privacy Policy.
                      </a>
                    </li>
                  </ul>
                  <p className="mt-2">These services may collect data according to their own privacy terms. We don't control or store this data ourselves.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Your Rights</h3>
                  <p>You can request deletion of your account and associated email by contacting us at [your support email].</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Data Storage</h3>
                  <p>We store minimal data securely, with limited access and only for operational needs.</p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Support
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Support</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">Support functionality coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
};

export default Footer;
