
import { useRef, useEffect } from 'react';

// Available alarm sounds
const ALARM_SOUNDS = {
  minimalistic: '/alarm-beeps/minimalistic.mp3',
  wooden: '/alarm-beeps/wooden.mp3',
  snappy: '/alarm-beeps/snappy.mp3',
  level: '/alarm-beeps/level.mp3',
};

type AlarmSoundType = keyof typeof ALARM_SOUNDS;

export function useTimerSound(enabled: boolean = true, volume: number = 1, soundType: string = 'minimalistic') {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    const soundPath = ALARM_SOUNDS[soundType as AlarmSoundType] || ALARM_SOUNDS.minimalistic;
    audioRef.current = new Audio(soundPath);
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundType]);
  
  // Update volume when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const playSound = () => {
    if (enabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => 
        console.error("Error playing sound:", err)
      );
    }
  };
  
  return { playSound };
}
