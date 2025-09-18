
import React from 'react';
import { Button } from "@focusdive/ui";
import { cn } from '@/lib/utils';

interface TimerProps {
  time: string;
  mode: 'focus' | 'break';
  isActive: boolean;
  onAddFocusMinutes: () => void;
}

const Timer: React.FC<TimerProps> = ({ time, mode, isActive, onAddFocusMinutes }) => {
  return (
    <div 
      className={cn(
        "timer-container rounded-2xl p-8 md:p-12 transition-all duration-500 shadow-lg relative",
        mode === 'focus' 
          ? "focus-mode bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60" 
          : "break-mode bg-gradient-to-br from-emerald-500/90 to-emerald-500/70 dark:from-emerald-600/80 dark:to-emerald-600/60",
        isActive ? "animate-pulse-soft" : ""
      )}
    >
      <div className="text-white text-center">
        <div className="mb-2 text-lg font-medium uppercase tracking-wide">
          {mode === 'focus' ? 'Focus Time' : 'Break Time'}
        </div>
        <div className="timer-text text-6xl md:text-8xl font-bold tracking-tight">
          {time}
        </div>
      </div>
      
      {/* +5 Focus Minutes Button - Bottom Right */}
      <Button
        onClick={onAddFocusMinutes}
        size="sm"
        variant="secondary"
        className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
      >
        +5 Focus
      </Button>
    </div>
  );
};

export default Timer;
