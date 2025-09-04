
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  mode: 'focus' | 'break';
  onToggleTimer: () => void;
  onReset: () => void;
  onToggleMode: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  mode,
  onToggleTimer,
  onReset,
  onToggleMode,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-6">
      <Button 
        onClick={onToggleTimer}
        size="lg" 
        className="flex-1 py-6 text-lg"
        variant="default"
      >
        {isActive ? (
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
        onClick={onReset} 
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
