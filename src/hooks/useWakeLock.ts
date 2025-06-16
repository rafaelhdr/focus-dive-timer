
import { wakeLockService } from '@/services/wakeLockService';

export function useWakeLock() {
  return {
    activateWakeLock: wakeLockService.activateWakeLock,
    deactivateWakeLock: wakeLockService.deactivateWakeLock,
    isWakeLockSupported: wakeLockService.isSupported,
  };
}
