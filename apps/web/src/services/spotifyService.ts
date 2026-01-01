import { apiUrl } from "@focusdive/config";
import { getCommonHeaders } from "@/utils/apiUtils";

/**
 * Refresh Spotify access token
 */
export const refreshSpotifyToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Refreshing Spotify access token...');
    
    const response = await fetch(`${apiUrl}/spotify/refresh-token`, {
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
    const response = await fetch(`${apiUrl}/spotify/status`, {
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
          const retryResponse = await fetch(`${apiUrl}/spotify/status`, {
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
    
    const response = await fetch(`${apiUrl}/spotify/connect`, {
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
    
    const response = await fetch(`${apiUrl}/spotify/connect`, {
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
    
    const response = await fetch(`${apiUrl}/spotify/disconnect`, {
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
          const retryResponse = await fetch(`${apiUrl}/spotify/disconnect`, {
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

/**
 * Get current access token for Web Playback SDK
 */
export const getSpotifyAccessToken = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    console.log('Getting Spotify access token...');
    
    const response = await fetch(`${apiUrl}/spotify/refresh-token`, {
      method: 'POST',
      headers: getCommonHeaders(),
      credentials: 'include',
    });

    console.log('Spotify token response:', response.status, response.statusText);

    if (!response.ok) {
      // If we get a 401, try to refresh the token
      if (response.status === 401) {
        console.log('Spotify token might be expired, attempting refresh...');
        const refreshResult = await refreshSpotifyToken();
        
        if (refreshResult.success) {
          // Retry the original request after successful refresh
          const retryResponse = await fetch(`${apiUrl}/spotify/refresh-token`, {
            method: 'POST',
            headers: getCommonHeaders(),
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return { success: true, token: retryData.access_token };
          }
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get Spotify token:', errorData);
      return { 
        success: false, 
        error: errorData.error || 'Failed to get Spotify access token' 
      };
    }

    const data = await response.json();
    console.log('Spotify token received successfully');
    
    return { success: true, token: data.access_token };
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return { 
      success: false, 
      error: 'Network error occurred while getting Spotify access token' 
    };
  }
};

/**
 * Get user's playlists from Spotify
 */
export const getUserPlaylists = async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; playlists?: any[]; error?: string }> => {
  try {
    console.log('Fetching user playlists...');
    
    // First get a fresh access token
    const tokenResult = await getSpotifyAccessToken();
    if (!tokenResult.success || !tokenResult.token) {
      return { success: false, error: tokenResult.error || 'Failed to get access token' };
    }

    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch user playlists:', errorData);
      return { 
        success: false, 
        error: errorData.error?.message || 'Failed to fetch playlists' 
      };
    }

    const data = await response.json();
    console.log('User playlists fetched successfully');
    
    return { success: true, playlists: data.items || [] };
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return { 
      success: false, 
      error: 'Network error occurred while fetching playlists' 
    };
  }
};

/**
 * Search playlists using Spotify's search API and filter by user's playlists
 */
export const searchUserPlaylists = async (query: string): Promise<{ success: boolean; playlists?: any[]; error?: string }> => {
  if (!query.trim()) {
    return { success: true, playlists: [] };
  }

  try {
    console.log('Searching playlists for:', query);
    
    // First get a fresh access token
    const tokenResult = await getSpotifyAccessToken();
    if (!tokenResult.success || !tokenResult.token) {
      return { success: false, error: tokenResult.error || 'Failed to get access token' };
    }

    // Use Spotify's search API to find playlists
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`;
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to search playlists:', errorData);
      return { 
        success: false, 
        error: errorData.error?.message || 'Failed to search playlists' 
      };
    }

    const data = await response.json();
    const searchResults = data.playlists?.items || [];
    
    // Filter search results to only include user's playlists
    const filteredResults = searchResults.filter(playlist => !!playlist?.id)
    
    console.log(`Found ${filteredResults.length} user playlists matching "${query}" from ${searchResults.length} total search results`);
    
    return { success: true, playlists: filteredResults };
  } catch (error) {
    console.error('Error searching playlists:', error);
    return { 
      success: false, 
      error: 'Network error occurred while searching playlists' 
    };
  }
};
