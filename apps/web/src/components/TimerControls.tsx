import React from 'react';
import { Button } from "@focusdive/ui";
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useTimer } from '@focusdive/timer';
import { startTimer, resetTimer } from '@focusdive/timer';

const TimerControls: React.FC = () => {
  const { mode, isRunning, pause, setMode } = useTimer()
  const onToggleTimer = () => {
    if (!isRunning) {
      startTimer();
    } else {
      pause();
    }
  }
  const onToggleMode = () => {
    setMode(mode === 'focus' ? 'break' : 'focus');
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-6">
      <Button 
        onClick={onToggleTimer}
        size="lg" 
        className="flex-1 py-6 text-lg"
        variant="default"
      >
        {isRunning ? (
          <>
            <Pause className="mr-2" /> Pause
          </>
        ) : (
          <>
            <Play className="mr-2" /> Start
          </>
        )}
      </Button>
      
      <Button 
        onClick={resetTimer} 
        size="lg"
        className="flex-1 py-6 text-lg"
        variant="outline"
      >
        <RotateCcw className="mr-2" /> Reset
      </Button>
      
      <Button 
        onClick={onToggleMode} 
        size="lg"
        className="flex-1 py-6 text-lg"
        variant={mode === 'focus' ? "secondary" : "default"}
      >
        {mode === 'focus' ? (
          <>
            <Coffee className="mr-2" /> Switch to Break
          </>
        ) : (
          <>
            <Brain className="mr-2" /> Switch to Focus
          </>
        )}
      </Button>
    </div>
  );
};

export default TimerControls;
