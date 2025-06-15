
import { useRef } from 'react';

export function useWakeLock() {
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);
  const visibilityListenerAdded = useRef(false);
  const isWakeLockSupported = 'wakeLock' in navigator;

  const requestWakeLock = async (): Promise<void> => {
    if (!isWakeLockSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return;
    }

    try {
      if (wakeLockSentinel.current && !wakeLockSentinel.current.released) {
        // Already have an active wake lock
        return;
      }

      wakeLockSentinel.current = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated - screen will stay on during timer');
      
      // Listen for wake lock release
      wakeLockSentinel.current.addEventListener('release', () => {
        console.log('Wake lock was released');
        wakeLockSentinel.current = null;
      });
    } catch (error) {
      console.error('Failed to request wake lock:', error);
    }
  };

  const releaseWakeLock = async (): Promise<void> => {
    if (wakeLockSentinel.current && !wakeLockSentinel.current.released) {
      try {
        await wakeLockSentinel.current.release();
        wakeLockSentinel.current = null;
        console.log('Wake lock released - screen can now turn off');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  // Handle page visibility changes
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && wakeLockSentinel.current?.released) {
      // Reacquire wake lock if timer is still active - this callback will be provided by the caller
      await requestWakeLock();
    }
  };

  const addVisibilityListener = () => {
    if (!visibilityListenerAdded.current) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerAdded.current = true;
      console.log('Visibility change listener added');
    }
  };

  const removeVisibilityListener = () => {
    if (visibilityListenerAdded.current) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerAdded.current = false;
      console.log('Visibility change listener removed');
    }
  };

  const activateWakeLock = async () => {
    addVisibilityListener();
    await requestWakeLock();
  };

  const deactivateWakeLock = async () => {
    await releaseWakeLock();
    removeVisibilityListener();
  };

  return {
    activateWakeLock,
    deactivateWakeLock,
    isWakeLockSupported,
  };
}
