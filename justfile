[parallel]
dev: web api

web:
    pnpm config:build && pnpm web:dev

api:
    cd apps/api && uv run fastapi dev src/focusdive_api/main.py

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
