
import { API_URL } from "@/config/env";
import { getCommonHeaders } from "@/utils/apiUtils";

/**
 * Check if user has connected Spotify account
 */
export const checkSpotifyConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/spotify/status`, {
      method: 'GET',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to check Spotify connection:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.connected || false;
  } catch (error) {
    console.error('Error checking Spotify connection:', error);
    return false;
  }
};

/**
 * Exchange authorization code for access token
 */
export const exchangeSpotifyCode = async (code: string, codeVerifier: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Exchanging Spotify code for token...');
    
    const response = await fetch(`${API_URL}/spotify/connect`, {
      method: 'POST',
      headers: getCommonHeaders(),
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
      }),
      credentials: 'include',
    });

    console.log('Spotify token exchange response:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to exchange Spotify code:', errorData);
      return { 
        success: false, 
        error: errorData.error || 'Failed to connect to Spotify' 
      };
    }

    const data = await response.json();
    console.log('Spotify connection successful:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Error exchanging Spotify code:', error);
    return { 
      success: false, 
      error: 'Network error occurred while connecting to Spotify' 
    };
  }
};

/**
 * Disconnect Spotify account
 */
export const disconnectSpotify = async (): Promise<boolean> => {
  try {
    console.log('Disconnecting Spotify account...');
    
    const response = await fetch(`${API_URL}/spotify/disconnect`, {
      method: 'POST',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    console.log('Spotify disconnect response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Failed to disconnect Spotify:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error disconnecting Spotify:', error);
    return false;
  }
};
