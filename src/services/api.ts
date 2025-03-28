
import { API_URL } from '@/config/env';

export interface Preferences {
  focus_beep_enabled: boolean;
  focus_beep_volume: number;
}

export const fetchPreferences = async (): Promise<Preferences> => {
  try {
    const response = await fetch(`${API_URL}/preferences`);
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching preferences:', error);
    // Return default preferences if API call fails
    return {
      focus_beep_enabled: true,
      focus_beep_volume: 100
    };
  }
};

export const savePreferences = async (preferences: Preferences): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};
