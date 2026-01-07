import { apiUrl } from '@focusdive/config';

export interface AuthVerifyResponse {
  success: boolean;
  message?: string;
  access_token: string;
  refresh_token: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
}

export const loginWithEmail = async (email: string): Promise<AuthLoginResponse> => {
  try {
    console.log('Requesting login token for:', email);
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to request login token');
    }
    
    console.log('Login request successful:', data);
    return {
      success: true,
      message: data.message || 'Verification code sent to your email',
    };
  } catch (error: any) {
    console.error('Login request failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to request login token',
    };
  }
};

export const verifyToken = async (email: string, token: string): Promise<AuthVerifyResponse> => {
  try {
    console.log('Verifying token for:', email);
    const response = await fetch(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify token');
    }
    
    console.log('Token verification successful');
    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error: any) {
    console.error('Token verification failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify token',
    };
  }
};

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
