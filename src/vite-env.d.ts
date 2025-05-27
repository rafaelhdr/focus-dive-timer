
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_DOMAIN?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_SLACK_CLIENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
