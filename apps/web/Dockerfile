FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json* ./
COPY apps/web/package.json apps/web/

RUN pnpm fetch --filter ./apps/web

ARG VITE_API_DOMAIN \
    VITE_API_URL \
    VITE_APP_URL \
    VITE_SLACK_CLIENT_ID \
    VITE_SENTRY_DSN

ENV VITE_API_DOMAIN=$VITE_API_DOMAIN \
    VITE_API_URL=$VITE_API_URL \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_SLACK_CLIENT_ID=$VITE_SLACK_CLIENT_ID \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \

COPY . .

RUN pnpm -w install --frozen-lockfile
RUN pnpm --filter ./apps/web build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html/

COPY production/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx","-g","daemon off;"]

