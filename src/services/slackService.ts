
import { API_URL } from "@/config/env";
import { getCommonHeaders } from "@/utils/apiUtils";

/**
 * Check if the user is connected to Slack
 * @returns A Promise resolving to true if connected, false otherwise
 */
export const checkSlackConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/slack/status`, {
      headers: getCommonHeaders(),
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
