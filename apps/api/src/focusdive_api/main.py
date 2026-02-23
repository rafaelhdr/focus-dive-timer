import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from focusdive_api.api.v1.router import router as v1_router
from focusdive_api.core.mongo import connect_mongo, disconnect_mongo

origins = [
    "https://focusdive.app",
    "http://localhost:8080",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_mongo()
    yield
    disconnect_mongo()


def create_app() -> FastAPI:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    app = FastAPI(
        title="FocusDive API",
        lifespan=lifespan,
    )

    app.include_router(v1_router)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^(chrome-extension|moz-extension)://[a-z0-9-]+$",
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        return {"ok": True}

    return app


app = create_app()
