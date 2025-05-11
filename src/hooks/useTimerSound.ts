
import { useRef, useEffect } from 'react';

export function useTimerSound(enabled: boolean = true, volume: number = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/alarm-beeps/minimalistic.mp3');
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Update volume when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const playSound = () => {
    if (enabled && audioRef.current) {
      audioRef.current.play().catch(err => 
        console.error("Error playing sound:", err)
      );
    }
  };
  
  return { playSound };
}
