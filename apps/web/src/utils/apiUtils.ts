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
