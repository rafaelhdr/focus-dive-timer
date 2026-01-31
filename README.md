# FocusDive Extension

## Build requirements

- Node.js >= v24
- pnpm >= 10

## Install dependencies

pnpm install

## Run web version

pnpm web:dev

## Build for Extension

pnpm extension:build:<chrome|firefox>

The build output will be generated in the `apps/extension/dist/` directory.

# Authentication

Authentication is done via email one-time token (OTP).
Reviewers can log in using any email address they control and will receive a token by email to complete authentication.
No pre-created test account is required.
