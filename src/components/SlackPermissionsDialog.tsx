
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';

const SlackPermissionsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="h-4 w-4" />
          Permissions Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            App Installation Permissions
          </DialogTitle>
          <DialogDescription>
            Information about installing Focus Dive in your Slack workspace
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription>
              <div className="space-y-3">
                <p>
                  When installing Focus Dive, your company may have one of two policies:
                </p>
                
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">Option 1: Open Installation</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can install apps directly. The installation will complete immediately.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Option 2: Admin Approval Required</p>
                    <p className="text-sm text-muted-foreground">
                      Apps require administrator approval before installation.
                    </p>
                  </div>
                </div>
                
                <div className="bg-background/50 p-3 rounded border">
                  <p className="text-sm font-medium mb-1">If approval is required:</p>
                  <p className="text-sm text-muted-foreground">
                    Accept the installation request and contact your Slack administrators. 
                    Let them know you'd like to use Focus Dive to automatically update your 
                    status during focus sessions.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlackPermissionsDialog;
