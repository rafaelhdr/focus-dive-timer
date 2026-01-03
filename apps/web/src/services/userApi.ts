import { apiUrl } from '@focusdive/config';
import { getAccessToken } from '@focusdive/auth'

export interface UserSubscriptionData {
  email: string;
  has_subscription: boolean;
  spotify_approved?: boolean;
  spotify_access_requested?: boolean;
}

export const fetchUserSubscriptionData = async (): Promise<UserSubscriptionData | null> => {
  try {
    console.log('Fetching user subscription data from:', `${apiUrl}/auth/me`);
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Beader ${accessToken}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch user subscription data:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Fetched user subscription data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user subscription data:', error);
    return null;
  }
};

export const requestSpotifyAccess = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log('Requesting Spotify access...');
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/spotify/request-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to request Spotify access:', errorData);
      return { 
        success: false, 
        error: errorData.error || 'Failed to request Spotify access' 
      };
    }
    
    const data = await response.json();
    console.log('Spotify access request successful:', data);
    return { 
      success: true, 
      message: data.message || 'Spotify access request submitted successfully' 
    };
  } catch (error) {
    console.error('Error requesting Spotify access:', error);
    return { 
      success: false, 
      error: 'Network error occurred while requesting Spotify access' 
    };
  }
};
