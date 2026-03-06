from fastapi import APIRouter

from .timer import router as timer_router

router = APIRouter(prefix="/ws")
router.include_router(timer_router)
