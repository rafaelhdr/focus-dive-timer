import { apiUrl } from '@focusdive/config';

export interface AuthVerifyResponse {
  success: boolean;
  message?: string;
  access_token: string;
  refresh_token: string;
}


export const refreshAccessToken = async (refreshToken: string): Promise<AuthVerifyResponse> => {
  try {
    console.log('Refreshing access token');
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `Failed to refresh token (status: ${response.status})`);
    }

    const data = await response.json();
    console.log('Token refresh successful');
    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Use new refresh token if provided
    };
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token');
  }
};
