import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";

interface SlackIntegrationPreferences {
  slack_enabled?: boolean;
  slack_dnd_emoji?: string;
  slack_dnd_text?: string;
}

type IntegrationPreferences = SlackIntegrationPreferences

export const getIntegrationPreferences = async (): Promise<IntegrationPreferences> => {
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
      console.error('Failed to fetch integration preferences:', response.statusText);
      return {};
    }

    const data = await response.json();
    console.log('Loaded integration preferences:', data);
    return data;
  } catch (error) {
    console.error('Error fetching integration preferences:', error);
    return {};
  }
};

export const saveIntegrationPreferences = async (preferences: IntegrationPreferences): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/integrations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferences),
      credentials: 'include',
    });

    console.log('Save preferences response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Failed to save integration preferences:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving integration preferences:', error);
    return false;
  }
};
