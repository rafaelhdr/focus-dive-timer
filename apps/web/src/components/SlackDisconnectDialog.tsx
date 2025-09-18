
import React, { useState } from 'react';
import { Button } from "@focusdive/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/env';
import { getCommonHeaders } from '@/utils/apiUtils';

interface SlackDisconnectDialogProps {
  onDisconnected: () => void;
}

const SlackDisconnectDialog: React.FC<SlackDisconnectDialogProps> = ({ onDisconnected }) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    
    try {
      const response = await fetch(`${API_URL}/slack/disconnect`, {
        method: 'POST',
        headers: getCommonHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect from Slack');
      }

      setIsOpen(false);
      onDisconnected();
    } catch (error) {
      console.error('Error disconnecting from Slack:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect from Slack. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
          <Unlink className="h-4 w-4" />
          Disconnect
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect from Slack?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disconnect your Slack account from Focus Dive? 
            This will stop automatic status updates during your focus sessions. 
            You can always reconnect later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SlackDisconnectDialog;
