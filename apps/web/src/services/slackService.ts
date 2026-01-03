import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";

/**
 * Check if the user is connected to Slack
 * @returns A Promise resolving to true if connected, false otherwise
 */
export const checkSlackConnection = async (): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/slack/status`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to check Slack connection status:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.is_connected === true;
  } catch (error) {
    console.error('Error checking Slack connection:', error);
    return false;
  }
};
