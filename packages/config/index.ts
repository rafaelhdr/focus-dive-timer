interface AppConfig {
  apiDomain: string;
  apiUrl: string;
  apiNewUrl: string;
  appUrl: string;
  isDebug: boolean;
  slackClientId: string;
  sentryDsn: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]?.trim();
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

const configApiDomain = getEnvVar('VITE_API_DOMAIN', 'api.focusdive.app');

const getAppUrl = () => {
  if (typeof window === "undefined") {
    return getEnvVar("VITE_APP_URL", "");
  }
  return getEnvVar("VITE_APP_URL", window.location.origin);
};

const config: AppConfig = {
  apiDomain: configApiDomain,
  apiUrl: getEnvVar('VITE_API_URL', `https://${configApiDomain}`),
  apiNewUrl: getEnvVar('VITE_API_NEW_URL', `https://${configApiDomain}`),
  appUrl: getEnvVar('VITE_APP_URL', getAppUrl()),
  isDebug: getEnvVar('VITE_DEBUG', 'false').toLowerCase() === 'true',
  slackClientId: getEnvVar('VITE_SLACK_CLIENT_ID', ''),
  sentryDsn: getEnvVar('VITE_SENTRY_DSN', ''),
};

export const configSlackRedirectUri = `${config.appUrl}/slack/connect`;
export const slackAuthUrl = `https://slack.com/oauth/v2/authorize?user_scope=dnd:write,users.profile:write,users:write&client_id=${config.slackClientId}&redirect_uri=${encodeURIComponent(configSlackRedirectUri)}`;

export default config;
export const {
  apiDomain,
  apiUrl,
  apiNewUrl,
  appUrl,
  isDebug,
  slackClientId,
  sentryDsn
} = config;
