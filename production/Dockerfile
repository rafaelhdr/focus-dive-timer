FROM node:22 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ARG VITE_API_DOMAIN=${VITE_API_DOMAIN}
ARG VITE_API_URL=${VITE_API_DOMAIN}
ARG VITE_APP_URL=${VITE_APP_URL}
ARG VITE_SLACK_CLIENT_ID=${VITE_SLACK_CLIENT_ID}
ARG VITE_SENTRY_DSN=${VITE_SENTRY_DSN}

ENV VITE_API_DOMAIN=$VITE_API_DOMAIN \
    VITE_API_URL=$VITE_API_URL \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_SLACK_CLIENT_ID=$VITE_SLACK_CLIENT_ID

RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY production/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
