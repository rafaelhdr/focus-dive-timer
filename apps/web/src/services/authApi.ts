import { apiUrl } from '@focusdive/config';
import { getAccessToken } from "@focusdive/auth";

// Types for auth responses
export interface AuthLoginResponse {
  success: boolean;
  message: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

// Login with email to request verification token
export const loginWithEmail = async (email: string): Promise<AuthLoginResponse> => {
  try {
    console.log('Requesting login token for:', email);
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

// Verify the token and get access tokens
export const verifyToken = async (email: string, token: string): Promise<AuthVerifyResponse> => {
  try {
    console.log('Verifying token for:', email);
    const accessToken = await getAccessToken();
    const response = await fetch(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('focus_dive_access_token');
  return !!accessToken;
};

// Function to get the current refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('focus_dive_refresh_token');
};

// Store authentication tokens
export const storeAuthTokens = (accessToken: string, refreshToken: string, email: string): void => {
  localStorage.setItem('focus_dive_access_token', accessToken);
  localStorage.setItem('focus_dive_refresh_token', refreshToken);
  localStorage.setItem('focus_dive_user_email', email);
};

// Clear authentication tokens
export const clearAuthTokens = (): void => {
  localStorage.removeItem('focus_dive_access_token');
  localStorage.removeItem('focus_dive_refresh_token');
  localStorage.removeItem('focus_dive_user_email');
};
