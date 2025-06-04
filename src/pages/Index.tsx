
import React from 'react';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTimer } from '@/hooks/useTimer';
import IntegrationsInfoDialog from '@/components/IntegrationsInfoDialog';

const Index = () => {
  const { 
    isActive, 
    mode, 
    formattedTime, 
    settings,
    toggleTimer, 
    resetTimer, 
    toggleMode, 
    updateSettings 
  } = useTimer();

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto p-4">
        <header className="mb-8 text-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Focus Dive</h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-muted-foreground">
              Block Distractions and Deep Work
            </p>
            <IntegrationsInfoDialog />
          </div>
        </header>

        <div className="w-full max-w-md">
          <Timer 
            time={formattedTime} 
            mode={mode} 
            isActive={isActive} 
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
    </div>
  );
};

export default Index;
