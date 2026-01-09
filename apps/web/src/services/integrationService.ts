import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";

interface SlackIntegrationSettings {
  slack_enabled?: boolean;
  slack_dnd_emoji?: string;
  slack_dnd_text?: string;
}

interface IntegrationSettings extends SlackIntegrationSettings {}

export const getIntegrationSettings = async (): Promise<IntegrationSettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
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

export const saveIntegrationSettings = async (settings: IntegrationSettings): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
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
