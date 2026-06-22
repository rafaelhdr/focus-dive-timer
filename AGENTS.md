# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Overview

FocusDive is a Pomodoro timer application with a pnpm monorepo structure. It supports web and browser extension (Chrome/Firefox) deployments, with real-time synchronization, email OTP authentication, and Slack integration.

## Commands

```bash
# Install dependencies
pnpm install

# Development (web app + API in parallel via justfile)
just dev

# Web app only
pnpm web:dev           # Dev server on port 8080

# Extension
pnpm extension:dev     # Dev server on port 8081

# Build
pnpm web:build
pnpm extension:build:chrome
pnpm extension:build:firefox

# Type checking
pnpm typecheck         # Entire monorepo
pnpm web:typecheck     # Web app only

# Lint
pnpm lint
pnpm lint:fix

# Tests
pnpm test              # All packages recursively

# Regenerate API client from OpenAPI schema
pnpm openapi:generate && pnpm openapi:convert
```

### Docker Compose (local development)

```bash
# Start all services with hot-reload (watches for file changes)
just compose

# Build images without starting
just compose-build

# Stop all services
just compose-down

# View logs
just compose-logs
```

Services:
- **Web**: http://localhost:8080 (Vite with HMR)
- **API**: http://localhost:5000 (FastAPI with auto-reload)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Mailpit**: http://localhost:8025 (SMTP catch-all for dev emails)

To run a single test file, cd into the package (e.g., `packages/timer`) and run `pnpm vitest run src/hooks/useTimer.test.ts`.

## Architecture

### Monorepo Structure

```
apps/
  api/          # Python FastAPI backend
  web/          # React web app
  extension/    # Browser extension (Chrome/Firefox)
packages/
  timer/        # Timer state management, WebSocket sync, UI components
  auth/         # Email OTP auth flow, hooks, events
  auth-token/   # Token storage abstraction
  api-client/   # OpenAPI-generated type-safe API client (openapi-fetch + openapi-react-query)
  config/       # Environment variables, API URLs, Slack OAuth config
  preferences/  # User preferences CRUD with React Query
  storage/      # Browser storage utilities
  alarm/        # Audio alarm functionality
  ui/           # Shared UI components (Radix UI + Tailwind)
  utils/        # Shared utilities
```

### State Management

- **Zustand** for client state: `timerStore` (timer mode/duration/running state), `authStore` (user session)
- **React Query** for server state: wraps the OpenAPI client via `openapi-react-query`
- Query keys defined in `packages/api-client/src/index.ts` as `fdKeys.*`

### Real-time Sync

Timer state is synchronized across tabs/devices via WebSocket (`packages/timer/src/realtime/`):
- `socketClient.ts` manages connection with Bearer token auth embedded in the URL
- `useTimerRealtime.ts` is the React hook that subscribes and applies server updates
- `sync.ts` handles message routing and calls `timerStore.setFromServer()`

### API Client

`packages/api-client` uses `openapi-fetch` for type-safe HTTP calls and `openapi-react-query` for hooks. Types are auto-generated from the OpenAPI schema. Inject Bearer tokens via request middleware configured in the client.

### Authentication

Email OTP flow — no passwords. Key exports from `packages/auth`:
- `initAuth()` — initialize on app startup
- `useRequestLoginToken()` / `useVerifyLoginToken()` — login flow hooks
- `useMe()` — current user
- `useLogout()`
- `authEvents` — mitt event emitter for auth state changes

### Extension vs Web

The extension (`apps/extension`) shares all packages with the web app. It adds:
- `background/` — background service worker
- `browser/` — abstraction over Chrome/Firefox APIs
- Separate Vite config that conditionally bundles for extension vs. standard web

### Environment Variables

All `VITE_*` prefixed. Key ones:
- `VITE_API_URL` — API endpoint
- `VITE_APP_URL` — frontend URL
- `VITE_SLACK_CLIENT_ID` — Slack OAuth
- `VITE_SENTRY_DSN` — error tracking

Loaded via `.env` file at the monorepo root; `dotenv -e .env --` prefix is used in scripts.
