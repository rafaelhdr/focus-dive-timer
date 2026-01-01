import { apiUrl } from "@focusdive/config";
import { getCommonHeaders } from "@/utils/apiUtils";

interface SlackIntegrationSettings {
  slack_enabled?: boolean;
  slack_dnd_emoji?: string;
  slack_dnd_text?: string;
}

interface SpotifyIntegrationSettings {
  spotify_enable?: boolean;
  spotify_focus_playlist?: any; // Full playlist JSON
  spotify_break_playlist?: any; // Full playlist JSON
  spotify_break_keep_focus_sound?: boolean;
}

interface IntegrationSettings extends SlackIntegrationSettings, SpotifyIntegrationSettings {}

/**
 * Get integration settings
 */
export const getIntegrationSettings = async (): Promise<IntegrationSettings> => {
  try {
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'GET',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to fetch integration settings:', response.statusText);
      return {};
    }

    const data = await response.json();
    console.log('Loaded integration settings:', data);
    return data;
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    return {};
  }
};

/**
 * Save integration settings
 */
export const saveIntegrationSettings = async (settings: IntegrationSettings): Promise<boolean> => {
  try {
    console.log('Saving integration settings with headers:', getCommonHeaders());
    console.log('Settings to save:', settings);
    
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'PUT',
      headers: getCommonHeaders(),
      body: JSON.stringify(settings),
      credentials: 'include',
    });

    console.log('Save settings response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Failed to save integration settings:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving integration settings:', error);
    return false;
  }
};

/**
 * Save Spotify-specific settings
 */
export const saveSpotifySettings = async (settings: SpotifyIntegrationSettings): Promise<boolean> => {
  try {
    console.log('Saving Spotify integration settings:', settings);
    
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'PUT',
      headers: getCommonHeaders(),
      body: JSON.stringify(settings),
      credentials: 'include',
    });

    console.log('Save Spotify settings response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Failed to save Spotify settings:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving Spotify settings:', error);
    return false;
  }
};

/**
 * Get Spotify-specific settings
 */
export const getSpotifySettings = async (): Promise<SpotifyIntegrationSettings> => {
  try {
    const allSettings = await getIntegrationSettings();
    return {
      spotify_enable: allSettings.spotify_enable,
      spotify_focus_playlist: allSettings.spotify_focus_playlist,
      spotify_break_playlist: allSettings.spotify_break_playlist,
      spotify_break_keep_focus_sound: allSettings.spotify_break_keep_focus_sound,
    };
  } catch (error) {
    console.error('Error fetching Spotify settings:', error);
    return {};
  }
};
