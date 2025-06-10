import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Slack, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('focus_dive_onboarding_dismissed', 'true');
    setCurrentStep(1); // Reset for next time
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Welcome to Focus Dive!</DialogTitle>
              <DialogDescription className="text-base">
                Focus Dive is a Pomodoro timer app designed to help you maintain deep focus and productivity.
                <br /><br />
                The Pomodoro Technique uses timed intervals - typically 25 minutes of focused work followed by short breaks - to enhance concentration and prevent burnout.
              </DialogDescription>
            </DialogHeader>
          </div>
        );
      case 2:
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Slack className="w-8 h-8 text-emerald-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Smart Integrations</DialogTitle>
              <DialogDescription className="text-base">
                Focus Dive integrates with your favorite tools to minimize distractions. Currently, we support Slack integration that automatically sets your status to "Do Not Disturb" during focus sessions.
                <br /><br />
                You can customize your Pomodoro intervals, break durations, and notification preferences in the settings to match your workflow perfectly.
              </DialogDescription>
            </DialogHeader>
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">We're Just Getting Started</DialogTitle>
              <DialogDescription className="text-base">
                Focus Dive is actively being developed with your productivity in mind. We're constantly working on new features and integrations.
                <br /><br />
                Have ideas on how we can make Focus Dive better for your workflow? We'd love to hear from you! Reach out to{' '}
                <a 
                  href="mailto:support@focusdive.app" 
                  className="text-primary hover:underline"
                >
                  support@focusdive.app
                </a>{' '}
                to share your suggestions.
              </DialogDescription>
            </DialogHeader>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">        
        {renderStepContent()}
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
