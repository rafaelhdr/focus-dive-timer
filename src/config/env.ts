
// Environment variables with default fallbacks
export const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'api.focusdive.app';
export const API_URL = import.meta.env.VITE_API_URL || `https://${API_DOMAIN}`;

// Slack integration variables
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
export const REDIRECT_URI = `${APP_URL}/slack/connect`;
export const CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID || '';
export const SLACK_AUTH_URL = `https://slack.com/oauth/v2/authorize?user_scope=users:write&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

console.log('API configuration:', {
  API_DOMAIN,
  API_URL,
  APP_URL,
  REDIRECT_URI,
  CLIENT_ID,
});
