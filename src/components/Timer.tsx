
import React from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  time: string;
  mode: 'focus' | 'break';
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ time, mode, isActive }) => {
  return (
    <div 
      className={cn(
        "timer-container rounded-2xl p-8 md:p-12 transition-all duration-500 shadow-lg",
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
    </div>
  );
};

export default Timer;
