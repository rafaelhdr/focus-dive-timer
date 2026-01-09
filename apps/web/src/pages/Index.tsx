
import { useEffect, useState } from 'react';
import { Timer } from '@focusdive/timer';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SubscriptionAlert from '@/components/SubscriptionAlert';

import { useTimer } from '@/hooks/useTimer';
import { fetchUserSubscriptionData, UserSubscriptionData } from '@/services/userApi';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import { SiSlack } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from "@focusdive/ui";
import { getIntegrationSettings } from '@/services/integrationService';
import { useMe } from '@focusdive/auth';

const Index = () => {
  const { 
    settings,
    updateSettings 
  } = useTimer();
  const { data: user } = useMe();

  const navigate = useNavigate();
  const [userSubscriptionData, setUserSubscriptionData] = useState<UserSubscriptionData | null>(null);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [showPomodoroButton, setShowPomodoroButton] = useState(true);

  // Check if Pomodoro button should be shown
  useEffect(() => {
    const pomodoroButtonClicked = localStorage.getItem('pomodoro_button_clicked') === 'true';
    setShowPomodoroButton(!pomodoroButtonClicked);
  }, []);

  // Load integration settings to determine icon colors
  useEffect(() => {
    const loadIntegrationSettings = async () => {
      if (!user) {
        setSlackEnabled(false);
        return;
      }

      setIntegrationsLoading(true);
      try {
        const settings = await getIntegrationSettings();
        setSlackEnabled(settings.slack_enabled || false);
      } catch (error) {
        console.error('Error loading integration settings:', error);
        setSlackEnabled(false);
      } finally {
        setIntegrationsLoading(false);
      }
    };

    loadIntegrationSettings();
  }, [user]);

  // Check if subscription alert should be shown
  useEffect(() => {
    const checkSubscriptionAlert = async () => {
      if (!user) {
        setShowSubscriptionAlert(false);
        return;
      }

      const dismissedAlert = localStorage.getItem('dismiss_subscription_alert') === 'true';
      if (dismissedAlert) {
        setShowSubscriptionAlert(false);
        return;
      }

      const subscriptionData = await fetchUserSubscriptionData();
      setUserSubscriptionData(subscriptionData);
      
      if (subscriptionData && !subscriptionData.has_subscription) {
        setShowSubscriptionAlert(true);
      } else {
        setShowSubscriptionAlert(false);
      }
    };

    checkSubscriptionAlert();
  }, [user]);

  const handleDismissAlert = () => {
    localStorage.setItem('dismiss_subscription_alert', 'true');
    setShowSubscriptionAlert(false);
  };

  const handleSlackClick = () => {
    navigate('/integrations/slack');
  };

  const handlePomodoroButtonClick = () => {
    localStorage.setItem('pomodoro_button_clicked', 'true');
    setShowPomodoroButton(false);
    navigate('/about-pomodoro');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto p-4">
        <header className="mb-8 text-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Focus Dive</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-muted-foreground">
              Block Distractions and Deep Work
            </p>
            <IntegrationsInfoDialog />
          </div>
          
          {/* Pomodoro Technique Button */}
          {showPomodoroButton && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePomodoroButtonClick}
                className="text-sm"
              >
                What is Pomodoro Technique?
              </Button>
            </div>
          )}
          
          {/* Integration Icons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSlackClick}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              title="Slack Integration"
            >
              <SiSlack 
                className={`h-5 w-5 transition-colors ${
                  slackEnabled 
                    ? "text-[#4A154B] hover:text-[#4A154B]/80" 
                    : "text-muted-foreground hover:text-foreground"
                }`} 
              />
            </button>
          </div>
        </header>

        <div className="w-full max-w-md">
          {showSubscriptionAlert && (
            <SubscriptionAlert onDismiss={handleDismissAlert} />
          )}
          <Timer />

          <TimerControls />

          <SettingsPanel 
            focusDuration={settings.focusDuration}
            breakDuration={settings.breakDuration}
            onUpdateFocusDuration={(value) => updateSettings({ focusDuration: value })}
            onUpdateBreakDuration={(value) => updateSettings({ breakDuration: value })}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
