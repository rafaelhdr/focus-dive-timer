
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/config/env';
import { TimerData } from './types';

export function useTimerSocket() {
  const socketRef = useRef<Socket | null>(null);
  const socketInitializedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (socketInitializedRef.current) return;

    console.log('Initializing WebSocket connection to:', `${API_URL}/timer`);
    socketRef.current = io(`${API_URL}/timer`, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected successfully');
      // Request current timer state from server
      socketRef.current?.emit('get_timer');
      console.log("socketRef.current?.emit", socketRef.current?.emit)
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socketInitializedRef.current = true;

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socketInitializedRef.current = false;
      }
    };
  }, []);

  // Subscribe to timer updates
  const subscribeToTimerUpdates = useCallback((callback: (data: TimerData) => void) => {
    if (!socketRef.current) return;

    console.log('Subscribing to timer updates');
    
    // Subscribe to timer_updated events
    socketRef.current.on('timer_updated', (data: TimerData) => {
      console.log('Received timer update:', data);
      callback(data);
    });
    
    // Also handle initial timer state response
    socketRef.current.on('timer_state', (data: TimerData) => {
      console.log('Received initial timer state:', data);
      callback(data);
    });

    return () => {
      socketRef.current?.off('timer_updated');
      socketRef.current?.off('timer_state');
    };
  }, []);

  // Send timer updates to server
  const updateTimer = useCallback((timerEndsAt: number | null, mode: 'focus' | 'break', isRunning: boolean) => {
    if (!socketRef.current) {
      console.warn('Cannot update timer: WebSocket not connected');
      return;
    }

    console.log('Updating timer on server:', { timerEndsAt, mode, isRunning });
    socketRef.current.emit('timer_data', {
      timerEndsAt,
      mode,
      isRunning,
    });
  }, []);

  // Request current timer state from server
  const getTimerState = useCallback(() => {
    if (!socketRef.current) {
      console.warn('Cannot get timer state: WebSocket not connected');
      return;
    }
    
    console.log('Requesting current timer state from server');
    socketRef.current.emit('get_timer');
  }, []);

  // Force reset timer on the server
  const resetTimer = useCallback(() => {
    if (!socketRef.current) {
      console.warn('Cannot reset timer: WebSocket not connected');
      return;
    }

    console.log('Resetting timer on server');
    socketRef.current.emit('reset_timer');
    
    // Also update with explicit null values to ensure reset
    updateTimer(null, 'focus', false);
  }, [updateTimer]);

  return {
    socket: socketRef.current,
    subscribeToTimerUpdates,
    updateTimer,
    resetTimer,
    getTimerState,
  };
}
