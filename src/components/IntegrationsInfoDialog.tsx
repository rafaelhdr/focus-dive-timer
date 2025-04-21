
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const IntegrationsInfoDialog: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 p-2"
          aria-label="About Integrations"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Integrations</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>
            <strong>Slack Integration:</strong> <br />
            When you start a focus session, Focus Dive will automatically set your Slack status to <b>unavailable</b> to help you block distractions.
            <br /><br />
            When your break time starts, your Slack status will resume to available, so you won't miss important messages.
            <br /><br />
            This automation only works if you connect your Slack account in the Integrations tab.
          </p>
        </DialogDescription>
        <DialogClose asChild>
          <Button variant="secondary" className="mt-4 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationsInfoDialog;
