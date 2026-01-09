import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTimerDisplay } from "@focusdive/timer";
import { useIsMobile } from '@/hooks/use-mobile';

const Timer: React.FC = () => {
  const location = useLocation();
  const { formattedTime, mode, isRunning } = useTimerDisplay();
  const isMobile = useIsMobile();

  const showTimer = location.pathname !== "/" && isRunning;
  if (!showTimer) return null;

  return (
    <Link to="/" className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mr-4 hover:opacity-80 transition-opacity`}>
      <span className={mode === 'focus' ? "text-primary" : "text-emerald-500"}>
        {formattedTime} {mode === 'focus' ? 'Focus' : 'Break'}
      </span>
    </Link>
  );
};

export default Timer;
