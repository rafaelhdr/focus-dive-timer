
import React from 'react';
import { Link } from 'react-router-dom';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      <header className="mb-8 text-center relative w-full max-w-md">
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
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
          enableSound={settings.enableSound}
          onUpdateFocusDuration={(value) => updateSettings({ focusDuration: value })}
          onUpdateBreakDuration={(value) => updateSettings({ breakDuration: value })}
          onToggleSound={(enabled) => updateSettings({ enableSound: enabled })}
        />
      </div>
    </div>
  );
};

export default Index;
