import { apiUrl } from '@focusdive/config';
import { getAccessToken } from '@focusdive/auth'

export interface UserSubscriptionData {
  email: string;
  has_subscription: boolean;
}

// Deprecated
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
