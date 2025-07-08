
import React, { useEffect, useState } from 'react';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SubscriptionAlert from '@/components/SubscriptionAlert';
import OnboardingModal from '@/components/OnboardingModal';
import { useTimer } from '@/hooks/useTimer';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserSubscriptionData, UserSubscriptionData } from '@/services/userApi';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';
import { SiSlack, SiSpotify } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getIntegrationSettings } from '@/services/integrationService';

const Index = () => {
  const { 
    isActive, 
    mode, 
    formattedTime, 
    settings,
    toggleTimer, 
    resetTimer, 
    toggleMode,
    addFocusMinutes,
    updateSettings 
  } = useTimer();

  const { auth } = useAuth();
  const navigate = useNavigate();
  const [userSubscriptionData, setUserSubscriptionData] = useState<UserSubscriptionData | null>(null);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [spotifyEnabled, setSpotifyEnabled] = useState(false);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('focus_dive_onboarding_dismissed') === 'true';
    
    // Show onboarding if user hasn't seen it and is not authenticated
    if (!hasSeenOnboarding && !auth.isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [auth.isAuthenticated]);

  // Load integration settings to determine icon colors
  useEffect(() => {
    const loadIntegrationSettings = async () => {
      if (!auth.isAuthenticated) {
        setSlackEnabled(false);
        setSpotifyEnabled(false);
        return;
      }

      setIntegrationsLoading(true);
      try {
        const settings = await getIntegrationSettings();
        setSlackEnabled(settings.slack_enabled || false);
        setSpotifyEnabled(settings.spotify_enable || false);
      } catch (error) {
        console.error('Error loading integration settings:', error);
        setSlackEnabled(false);
        setSpotifyEnabled(false);
      } finally {
        setIntegrationsLoading(false);
      }
    };

    loadIntegrationSettings();
  }, [auth.isAuthenticated]);

  // Initialize Spotify player when Spotify integration is enabled
  useEffect(() => {
    const initializeSpotify = async () => {
      if (!auth.isAuthenticated || !spotifyEnabled) {
        return;
      }

      // Check if Spotify SDK is loaded
      if (!window.Spotify) {
        console.log('Spotify SDK not loaded yet, will retry when ready');
        return;
      }

      const { useSpotifyStore } = await import('@/store/spotifyStore');
      const spotifyStore = useSpotifyStore.getState();
      
      // Load Spotify settings if not already loaded
      if (!spotifyStore.focusPlaylist && !spotifyStore.breakPlaylist) {
        await spotifyStore.loadSpotifySettings();
      }

      // Initialize Spotify player if not ready and not initializing
      if (!spotifyStore.isReady && !spotifyStore.isInitializing) {
        await spotifyStore.initialize();
      }
    };

    // Add a small delay to allow SDK to load
    const timer = setTimeout(initializeSpotify, 1000);
    return () => clearTimeout(timer);
  }, [auth.isAuthenticated, spotifyEnabled]);

  // Check if subscription alert should be shown
  useEffect(() => {
    const checkSubscriptionAlert = async () => {
      if (!auth.isAuthenticated) {
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
  }, [auth.isAuthenticated]);

  const handleDismissAlert = () => {
    localStorage.setItem('dismiss_subscription_alert', 'true');
    setShowSubscriptionAlert(false);
  };

  const handleAddFocusMinutes = () => {
    addFocusMinutes(5);
  };

  const handleSlackClick = () => {
    navigate('/integrations/slack');
  };

  const handleSpotifyClick = () => {
    navigate('/integrations/spotify');
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
            <button
              onClick={handleSpotifyClick}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors relative"
              title="Spotify Integration"
            >
              <SiSpotify 
                className={`h-5 w-5 transition-colors ${
                  spotifyEnabled 
                    ? "text-[#1DB954] hover:text-[#1DB954]/80" 
                    : "text-muted-foreground hover:text-foreground"
                }`} 
              />
              <Badge 
                variant="secondary" 
                className="absolute -top-0.5 -right-0.5 text-[10px] px-1 py-0 h-3 min-w-0 leading-none"
              >
                Beta
              </Badge>
            </button>
          </div>
        </header>

        <div className="w-full max-w-md">
          {showSubscriptionAlert && (
            <SubscriptionAlert onDismiss={handleDismissAlert} />
          )}

          <Timer 
            time={formattedTime} 
            mode={mode} 
            isActive={isActive}
            onAddFocusMinutes={handleAddFocusMinutes}
          />

          <TimerControls 
            isActive={isActive}
            mode={mode}
            onToggleTimer={toggleTimer}
            onReset={resetTimer}
            onToggleMode={toggleMode}
          />

          <SettingsPanel 
            focusDuration={settings.focusDuration}
            breakDuration={settings.breakDuration}
            onUpdateFocusDuration={(value) => updateSettings({ focusDuration: value })}
            onUpdateBreakDuration={(value) => updateSettings({ breakDuration: value })}
          />
        </div>
      </div>
      
      <Footer />
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  );
};

export default Index;
