
import { API_URL } from '@/config/env';
import { getCommonHeaders } from '@/utils/apiUtils';

export interface UserSubscriptionData {
  email: string;
  has_subscription: boolean;
}

export const fetchUserSubscriptionData = async (): Promise<UserSubscriptionData | null> => {
  try {
    console.log('Fetching user subscription data from:', `${API_URL}/auth/me`);
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getCommonHeaders(),
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
