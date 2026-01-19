import { TimerMode } from '@focusdive/timer';

// Umami analytics utility
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData);
  }
};

// Timer-specific tracking functions
export const analytics = {
  timerStarted: (mode: TimerMode, duration: number) => {
    trackEvent('timer_started', { mode, duration });
  },
  
  timerPaused: (mode: TimerMode, timeRemaining: number) => {
    trackEvent('timer_paused', { mode, timeRemaining });
  },
  
  timerCompleted: (mode: TimerMode, duration: number) => {
    trackEvent('timer_completed', { mode, duration });
  },
  
  timerReset: (mode: TimerMode) => {
    trackEvent('timer_reset', { mode });
  },
  
  modeToggled: (fromMode: TimerMode, toMode: TimerMode) => {
    trackEvent('mode_toggled', { fromMode, toMode });
  },
  
  settingsChanged: (setting: string, value: number) => {
    trackEvent('settings_changed', { setting, value });
  },
  
  onboardingCompleted: () => {
    trackEvent('onboarding_completed');
  },
  
  authAction: (action: 'login' | 'logout' | 'register') => {
    trackEvent('auth_action', { action });
  }
};
