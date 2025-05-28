FROM node:22 AS builder

WORKDIR /app

COPY production/.env.sentry-build-plugin .env.sentry-build-plugin
COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ENV VITE_API_DOMAIN=$VITE_API_DOMAIN \
    VITE_API_URL=$VITE_API_URL \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_SLACK_CLIENT_ID=$VITE_SLACK_CLIENT_ID \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY production/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
