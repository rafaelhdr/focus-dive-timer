
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'
import { useTimerStore } from './store/timerStore'

// Initialize Sentry
Sentry.init({
  dsn: "https://1208b9062b0c9ff82eae8df609baea00@o4509393812848640.ingest.de.sentry.io/4509393909055568",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/api\.focusdive\.app\//, /^https:\/\/.*\.focusdive\.app\//],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

// Initialize the timer store
useTimerStore.getState().initSocket();

createRoot(document.getElementById("root")!).render(<App />);
