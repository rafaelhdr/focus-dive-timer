
import { getAccessToken } from '@/services/authApi';

/**
 * Get or create a session ID
 * @returns The current session ID from localStorage or creates a new one
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('focus_dive_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('focus_dive_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Get common headers for API requests
 * @param includeAuth - Whether to include Authorization header (default: true)
 * @param includeSession - Whether to include Session ID header (default: true)
 * @returns Record containing headers for API requests
 */
export const getCommonHeaders = (
  token: string | null = null,
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const accessToken = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};
