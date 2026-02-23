[parallel]
dev: web api

web:
    pnpm web:dev

api:
    cd apps/api && uv run fastapi dev src/focusdive_api/main.py

openapi:
    pnpm openapi:generate && pnpm openapi:convert
