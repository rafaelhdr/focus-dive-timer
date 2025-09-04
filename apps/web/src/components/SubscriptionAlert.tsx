
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SubscriptionAlertProps {
  onDismiss: () => void;
}

const SubscriptionAlert: React.FC<SubscriptionAlertProps> = ({ onDismiss }) => {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <div className="flex items-start justify-between">
        <AlertDescription className="flex-1 pr-4">
          <p className="text-amber-800 dark:text-amber-200">
            <strong>Welcome to Focus Dive!</strong> You have one week of free usage. 
            To continue using all features after your trial, please visit our{' '}
            <Link 
              to="/subscriptions" 
              className="underline hover:no-underline font-medium"
            >
              subscription page
            </Link>
            .
          </p>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default SubscriptionAlert;
