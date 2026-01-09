import { Play, Pause, RotateCcw, Coffee, Clock } from 'lucide-react';
import { Button } from "@focusdive/ui";

interface TimerControlsProps {
  isActive: boolean;
  mode: 'focus' | 'break';
  onToggleTimer: () => void;
  onReset: () => void;
  onToggleMode: () => void;
}

export default function TimerControls({
  isActive,
  mode,
  onToggleTimer,
  onReset,
  onToggleMode,
}: TimerControlsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant="default" 
        className="px-4 flex-1"
        onClick={onToggleTimer}
      >
        {isActive ? (
          <>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start
          </>
        )}
      </Button>
      
      <Button 
        variant="default" 
        className="px-4"
        onClick={onReset}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
      
      <Button 
        variant="secondary" 
        className="px-4"
        onClick={onToggleMode}
      >
        {mode === 'focus' ? (
          <>
            <Coffee className="w-4 h-4 mr-2" />
            Switch to Break
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mr-2" />
            Switch to Focus
          </>
        )}
      </Button>
    </div>
  );
}
