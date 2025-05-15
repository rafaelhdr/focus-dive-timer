import { API_URL } from '@/config/env';

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

// Common headers for all API requests
const getCommonHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Login with email to request verification token
export const loginWithEmail = async (email: string): Promise<AuthLoginResponse> => {
  try {
    console.log('Requesting login token for:', email);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getCommonHeaders(),
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
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: getCommonHeaders(),
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

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<AuthVerifyResponse> => {
  try {
    console.log('Refreshing access token');
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: getCommonHeaders(refreshToken),
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }
    
    console.log('Token refresh successful');
    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Use new refresh token if provided
    };
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to refresh token',
    };
  }
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('focus_dive_access_token');
  return !!accessToken;
};

// Function to get the current access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('focus_dive_access_token');
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

// Add authorization header to requests
export const addAuthHeader = (headers: Record<string, string>): Record<string, string> => {
  const accessToken = getAccessToken();
  if (accessToken) {
    return { ...headers, Authorization: `Bearer ${accessToken}` };
  }
  return headers;
};
