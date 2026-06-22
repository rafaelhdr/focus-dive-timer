[parallel]
dev: web api

web:
    pnpm config:build && pnpm web:dev

api:
    cd apps/api && uv run fastapi dev src/focusdive_api/main.py

# Docker Compose (local development with hot-reload)
compose:
    docker compose up --watch

compose-build:
    docker compose build

compose-down:
    docker compose down

compose-logs:
    docker compose logs -f

[parallel]
lint: lint-backend lint-frontend

lint-backend:
    cd apps/api && uv run ruff check .

lint-frontend:
    pnpm lint

lint-fix: lint-backend-fix lint-frontend-fix

lint-backend-fix:
    cd apps/api && uv run ruff check --fix .

lint-frontend-fix:
    pnpm lint:fix

openapi:
    pnpm openapi:generate && pnpm openapi:convert

betterleaks:
    betterleaks dir .

betterleaks-git:
    betterleaks git .
