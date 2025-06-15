
import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isSupported = 'wakeLock' in navigator;

  const requestWakeLock = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return false;
    }

    try {
      if (wakeLockRef.current) {
        // Already have an active wake lock
        return true;
      }

      wakeLockRef.current = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated - screen will stay on');
      
      // Listen for wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake lock was released');
        wakeLockRef.current = null;
      });

      return true;
    } catch (error) {
      console.error('Failed to request wake lock:', error);
      return false;
    }
  };

  const releaseWakeLock = async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake lock released - screen can now turn off');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  const isActive = (): boolean => {
    return wakeLockRef.current !== null && !wakeLockRef.current.released;
  };

  // Handle page visibility changes - reacquire wake lock when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current?.released) {
        // Try to reacquire wake lock if it was previously active
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  return {
    isSupported,
    isActive: isActive(),
    requestWakeLock,
    releaseWakeLock
  };
}
