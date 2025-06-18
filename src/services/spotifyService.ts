import { API_URL } from "@/config/env";
import { getCommonHeaders } from "@/utils/apiUtils";

/**
 * Refresh Spotify access token
 */
export const refreshSpotifyToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Refreshing Spotify access token...');
    
    const response = await fetch(`${API_URL}/spotify/refresh-token`, {
      method: 'POST',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    console.log('Spotify token refresh response:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to refresh Spotify token:', errorData);
      return { 
        success: false, 
        error: errorData.error || 'Failed to refresh Spotify token' 
      };
    }

    const data = await response.json();
    console.log('Spotify token refreshed successfully:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return { 
      success: false, 
      error: 'Network error occurred while refreshing Spotify token' 
    };
  }
};

/**
 * Check if user has connected Spotify account with automatic token refresh
 */
export const checkSpotifyConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/spotify/status`, {
      method: 'GET',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      // If we get a 401, try to refresh the token
      if (response.status === 401) {
        console.log('Spotify token might be expired, attempting refresh...');
        const refreshResult = await refreshSpotifyToken();
        
        if (refreshResult.success) {
          // Retry the original request after successful refresh
          const retryResponse = await fetch(`${API_URL}/spotify/status`, {
            method: 'GET',
            headers: getCommonHeaders(),
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData.is_connected || false;
          }
        }
      }
      
      console.error('Failed to check Spotify connection:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.is_connected || false;
  } catch (error) {
    console.error('Error checking Spotify connection:', error);
    return false;
  }
};

/**
 * Get Spotify authorization URL from backend
 */
export const getSpotifyAuthUrl = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log('Getting Spotify auth URL...');
    
    const response = await fetch(`${API_URL}/spotify/connect`, {
      method: 'GET',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    console.log('Spotify auth URL response:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get Spotify auth URL:', errorData);
      return { 
        success: false, 
        error: errorData.error || 'Failed to get Spotify authorization URL' 
      };
    }

    const data = await response.json();
    console.log('Spotify auth URL received:', data);
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Error getting Spotify auth URL:', error);
    return { 
      success: false, 
      error: 'Network error occurred while getting Spotify authorization URL' 
    };
  }
};

/**
 * Exchange authorization code for access token
 */
export const exchangeSpotifyCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Exchanging Spotify code for token...');
    
    const response = await fetch(`${API_URL}/spotify/connect`, {
      method: 'POST',
      headers: getCommonHeaders(),
      body: JSON.stringify({
        code,
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
      // If we get a 401, try to refresh the token first
      if (response.status === 401) {
        console.log('Spotify token might be expired, attempting refresh...');
        const refreshResult = await refreshSpotifyToken();
        
        if (refreshResult.success) {
          // Retry the disconnect request after successful refresh
          const retryResponse = await fetch(`${API_URL}/spotify/disconnect`, {
            method: 'POST',
            headers: getCommonHeaders(),
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            return true;
          }
        }
      }
      
      console.error('Failed to disconnect Spotify:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error disconnecting Spotify:', error);
    return false;
  }
};
