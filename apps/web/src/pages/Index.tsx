import { useEffect, useState } from 'react';
import { Timer, TimerControls } from '@focusdive/timer';
import { get, set } from "@focusdive/storage";
import PreferencesPanel from '@/components/PreferencesPanel';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import { SiSlack } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { Button } from "@focusdive/ui";
import { getIntegrationPreferences } from '@/services/integrationService';
import { useMe } from '@focusdive/auth';

const Index = () => {
  const { data: user } = useMe();

  const navigate = useNavigate();

  const [slackEnabled, setSlackEnabled] = useState(false);
  const [showPomodoroButton, setShowPomodoroButton] = useState(true);

  useEffect(() => {
    (async () => {
      const clicked = await get('pomodoro_button_clicked');
      setShowPomodoroButton(clicked !== 'true');
    })();
  }, []);

  useEffect(() => {
    const loadIntegrationPreferences = async () => {
      if (!user) {
        setSlackEnabled(false);
        return;
      }

      try {
        const preferences = await getIntegrationPreferences();
        setSlackEnabled(preferences.slack_enabled || false);
      } catch (error) {
        console.error('Error loading integration preferences:', error);
        setSlackEnabled(false);
      }
    };

    loadIntegrationPreferences();
  }, [user]);

  const handleSlackClick = () => {
    navigate('/integrations/slack');
  };

  const handlePomodoroButtonClick = () => {
    void set('pomodoro_button_clicked', 'true');
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
                className={`h-5 w-5 transition-colors ${slackEnabled
                    ? "text-[#4A154B] hover:text-[#4A154B]/80"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              />
            </button>
          </div>
        </header>

        <div className="w-full max-w-md">
          <Timer />

          <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-6">
            <TimerControls />
          </div>

          <PreferencesPanel />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
