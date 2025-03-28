
import { API_URL } from '@/config/env';

export interface Preferences {
  focus_beep_enabled: boolean;
  focus_beep_volume: number;
}

export const fetchPreferences = async (): Promise<Preferences> => {
  try {
    console.log('Fetching preferences from:', `${API_URL}/preferences`);
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adding cache control to prevent browser caching issues
      cache: 'no-cache',
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
      focus_beep_volume: 100
    };
  }
};

export const savePreferences = async (preferences: Preferences): Promise<boolean> => {
  try {
    console.log('Saving preferences to:', `${API_URL}/preferences`, preferences);
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
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
