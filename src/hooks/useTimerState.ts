
import { useState, useEffect, useRef } from 'react';
import { triggerTimerEvent } from '@/services/api';
import { useTimerSocket } from './useTimerSocket';
import { TimerData } from './types';

type TimerMode = 'focus' | 'break';

interface UseTimerStateProps {
  focusDuration: number;
  breakDuration: number;
}

export function useTimerState({ focusDuration, breakDuration }: UseTimerStateProps) {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60); // default in seconds
  const intervalRef = useRef<number | null>(null);
  const timerEndTimeRef = useRef<number | null>(null);

  const onGetTimerData = (data: TimerData) => {
    setMode(data.mode);
    setIsActive(data.isRunning);
    if (data.timerEndsAt) {
      const currentTime = Date.now();
      const endTime = data.timerEndsAt;
      const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
      setTimeLeft(secondsLeft);
    }
  }
  
  // Initialize WebSocket communication
  const { isSocketConnected, updateTimer, resetTimer } = useTimerSocket({onGetTimerData});
  
  // Timer logic
  useEffect(() => {
    if (!isSocketConnected) {
      console.warn('WebSocket not connected.');
      return;
    }
    if (isActive && timeLeft > 0) {
      // Calculate end time if not already set
      if (timerEndTimeRef.current === null) {
        timerEndTimeRef.current = Date.now() + timeLeft * 1000;
        // Send initial timer state to server
        updateTimer(timerEndTimeRef.current, mode, true);
        
        // Trigger timer start event
        triggerTimerEvent('start', mode === 'focus' ? 'focus' : 'relax')
          .catch(err => console.error("Failed to trigger timer start:", err));
      }
      
      // Use window.setInterval instead of setInterval to ensure proper typing
      intervalRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const endTime = timerEndTimeRef.current || currentTime;
        const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        
        setTimeLeft(secondsLeft);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // When timer ends
      // Handle in the useTimer hook
    } else if (!isActive) {
      // If timer is paused, clear the end time reference
      if (timerEndTimeRef.current !== null) {
        // Only trigger stop if we're actually stopping an active timer
        triggerTimerEvent('stop', mode === 'focus' ? 'focus' : 'relax')
          .catch(err => console.error("Failed to trigger timer stop:", err));
      }
      
      timerEndTimeRef.current = null;
      // Inform server timer is paused
      updateTimer(null, mode, false);
    }
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, mode, updateTimer]);
  
  // Start/pause timer
  const toggleTimer = () => {
    if (!isActive) {
      // Starting the timer - calculate end time
      timerEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
      setTimeLeft(timeLeft);
      updateTimer(timerEndTimeRef.current, mode, true);
      
      // Trigger start event
      triggerTimerEvent('start', mode === 'focus' ? 'focus' : 'relax')
        .catch(err => console.error("Failed to trigger timer start:", err));
    } else {
      // Pausing the timer
      triggerTimerEvent('stop', mode === 'focus' ? 'focus' : 'relax')
        .catch(err => console.error("Failed to trigger timer stop:", err));
      
      timerEndTimeRef.current = null;
      updateTimer(null, mode, false);
    }
    setIsActive(!isActive);
  };
  
  // Reset timer to current mode's full duration
  const resetTimerHandler = () => {
    if (isActive) {
      // Only trigger stop if we're resetting an active timer
      triggerTimerEvent('stop', mode === 'focus' ? 'focus' : 'relax')
        .catch(err => console.error("Failed to trigger timer stop:", err));
    }
    
    setIsActive(false);
    const newDuration = mode === 'focus' 
      ? focusDuration * 60 
      : breakDuration * 60;
    setTimeLeft(newDuration);
    timerEndTimeRef.current = null;
    
    console.log('Resetting timer completely...');
    // Reset timer on the server using the resetTimer function
    resetTimer();
  };
  
  // Manually change mode
  const toggleMode = () => {
    if (isActive) {
      // If timer is active, stop the current mode
      triggerTimerEvent('stop', mode === 'focus' ? 'focus' : 'relax')
        .catch(err => console.error("Failed to trigger timer stop:", err));
    }
    
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setIsActive(false);
    const newDuration = nextMode === 'focus' 
      ? focusDuration * 60 
      : breakDuration * 60;
    setTimeLeft(newDuration);
    timerEndTimeRef.current = null;
    updateTimer(null, nextMode, false);
  };
  
  return {
    isActive,
    mode,
    timeLeft,
    toggleTimer,
    resetTimer: resetTimerHandler,
    toggleMode,
  };
}
