
import { API_URL } from "@/config/env";
import { getAccessToken } from "./authApi";

/**
 * Check if the user is connected to Slack
 * @returns A Promise resolving to true if connected, false otherwise
 */
export const checkSlackConnection = async (): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': localStorage.getItem('focus_dive_session_id') || '',
    };
    
    // Add Authorization header if user is authenticated
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_URL}/slack/status`, {
      headers,
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
