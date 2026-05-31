# FocusDive Timer

Block distractions and enable deep work with a Pomodoro-style timer.

**[focusdive.app](https://focusdive.app)** · [Chrome extension](https://chromewebstore.google.com/detail/focusdive-pomodoro-timer/klihekakgnmpmpmmgkiiikbgmblcfknl) · [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/focus-dive-extension/)

## Requirements

- Node.js >= 24
- pnpm >= 10

## Setup

```bash
pnpm install
cp .env.example .env  # fill in your values
pnpm web:dev          # http://localhost:8080
```

## Build extension

```bash
pnpm extension:build:chrome
pnpm extension:build:firefox
```

## Authentication

Email OTP — no password needed.

## License

MIT
