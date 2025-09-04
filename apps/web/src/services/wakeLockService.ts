
class WakeLockService {
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private visibilityListenerAdded = false;
  private isWakeLockSupported = 'wakeLock' in navigator;

  private requestWakeLock = async (): Promise<void> => {
    if (!this.isWakeLockSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return;
    }

    try {
      if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
        // Already have an active wake lock
        return;
      }

      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated - screen will stay on during timer');
      
      // Listen for wake lock release
      this.wakeLockSentinel.addEventListener('release', () => {
        console.log('Wake lock was released');
        this.wakeLockSentinel = null;
      });
    } catch (error) {
      console.error('Failed to request wake lock:', error);
    }
  };

  private releaseWakeLock = async (): Promise<void> => {
    if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
      try {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        console.log('Wake lock released - screen can now turn off');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  // Handle page visibility changes
  private handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && this.wakeLockSentinel?.released) {
      // Reacquire wake lock if timer is still active
      await this.requestWakeLock();
    }
  };

  private addVisibilityListener = () => {
    if (!this.visibilityListenerAdded) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.visibilityListenerAdded = true;
      console.log('Visibility change listener added');
    }
  };

  private removeVisibilityListener = () => {
    if (this.visibilityListenerAdded) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.visibilityListenerAdded = false;
      console.log('Visibility change listener removed');
    }
  };

  public activateWakeLock = async () => {
    this.addVisibilityListener();
    await this.requestWakeLock();
  };

  public deactivateWakeLock = async () => {
    await this.releaseWakeLock();
    this.removeVisibilityListener();
  };

  public get isSupported() {
    return this.isWakeLockSupported;
  }
}

export const wakeLockService = new WakeLockService();
