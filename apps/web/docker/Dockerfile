FROM node:22 AS builder
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

COPY . .
RUN mv .env.production .env && \
    pnpm --filter ./packages/config build && \
    mv tsconfig.web-build.json tsconfig.json && \
    pnpm web:build

FROM nginx:alpine

COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
