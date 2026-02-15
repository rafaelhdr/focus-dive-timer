import { apiNewUrl } from '@focusdive/config';

export interface AuthVerifyResponse {
  access_token: string;
  refresh_token: string;
}


export const refreshAccessToken = async (refreshToken: string): Promise<AuthVerifyResponse> => {
  try {
    const response = await fetch(`${apiNewUrl}/v1/users/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `Failed to refresh token (status: ${response.status})`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token');
  }
};
