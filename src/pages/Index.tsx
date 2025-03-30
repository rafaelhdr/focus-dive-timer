
import React from 'react';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import Navigation from '@/components/Navigation';
import { useTimer } from '@/hooks/useTimer';

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
    <div className="min-h-screen flex flex-col items-center bg-background p-4 transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 flex flex-col items-center justify-center flex-1 w-full max-w-md">
        <header className="mb-8 text-center relative w-full">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Focus Dive</h1>
          <p className="text-muted-foreground">Deep work. Timed breaks. Stay productive.</p>
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
    </div>
  );
};

export default Index;
