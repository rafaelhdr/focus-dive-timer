[parallel]
dev: web api

web:
    pnpm config:build && pnpm web:dev

api:
    cd apps/api && uv run fastapi dev src/focusdive_api/main.py

lint:
    cd apps/api && uv run ruff check .

lint-fix:
    cd apps/api && uv run ruff check --fix .

openapi:
    pnpm openapi:generate && pnpm openapi:convert
