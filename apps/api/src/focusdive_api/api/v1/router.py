from fastapi import APIRouter

from .preferences import router as preferences_router
from .users import router as users_router

router = APIRouter(prefix="/v1")

router.include_router(users_router, prefix="/users")
router.include_router(preferences_router, prefix="/preferences")
