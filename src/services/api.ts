import { API_URL } from '@/config/env';
import { getAccessToken } from './authApi';
import { getCommonHeaders } from '@/utils/apiUtils';

export interface Preferences {
  focus_beep_enabled: boolean;
  focus_beep_volume: number;
  alarm_sound: string;
  autostart_break?: boolean;
  autostart_focus?: boolean;
}

export const fetchPreferences = async (): Promise<Preferences> => {
  try {
    console.log('Fetching preferences from:', `${API_URL}/preferences`);
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'GET',
      headers: getCommonHeaders(),
      // Adding cache control to prevent browser caching issues
      cache: 'no-cache',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched preferences:', data);
    return data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    // Return default preferences if API call fails
    return {
      focus_beep_enabled: true,
      focus_beep_volume: 100,
      alarm_sound: 'minimalistic',
      autostart_break: true,
      autostart_focus: true
    };
  }
};

export const savePreferences = async (preferences: Partial<Preferences>): Promise<boolean> => {
  try {
    console.log('Saving preferences to:', `${API_URL}/preferences`, preferences);
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: getCommonHeaders(),
      body: JSON.stringify(preferences),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save preferences: ${response.status}`);
    }
    
    console.log('Preferences saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

// Trigger timer events on the server
export const triggerTimerEvent = async (
  action: 'start' | 'stop',
  type: 'focus' | 'relax'
): Promise<boolean> => {
  try {
    console.log(`Triggering timer event: ${action} ${type}`);
    const response = await fetch(`${API_URL}/timer/trigger`, {
      method: 'POST',
      headers: getCommonHeaders(),
      body: JSON.stringify({ action, type }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger timer event: ${response.status}`);
    }
    
    console.log('Timer event triggered successfully');
    return true;
  } catch (error) {
    console.error('Error triggering timer event:', error);
    return false;
  }
};
