
import { API_URL } from "@/config/env";
import { getCommonHeaders } from "@/utils/apiUtils";

interface SlackIntegrationSettings {
  slack_dnd_emoji?: string;
  slack_dnd_text?: string;
}

/**
 * Get integration settings
 */
export const getIntegrationSettings = async (): Promise<SlackIntegrationSettings> => {
  try {
    const response = await fetch(`${API_URL}/integrations`, {
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
export const saveIntegrationSettings = async (settings: SlackIntegrationSettings): Promise<boolean> => {
  try {
    console.log('Saving integration settings with headers:', getCommonHeaders());
    console.log('Settings to save:', settings);
    
    const response = await fetch(`${API_URL}/integrations`, {
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
