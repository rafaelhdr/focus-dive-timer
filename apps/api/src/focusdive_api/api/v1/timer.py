import logging

from fastapi import APIRouter, Depends, HTTPException

from focusdive_api.core.auth import get_current_subject
from focusdive_api.users.repo import UserRepo, get_user_repo
from focusdive_api.ws.connections import manager

from .schemas import TimerInOut

logger = logging.getLogger(__name__)

router = APIRouter(tags=["timer"])


@router.put("", response_model=TimerInOut)
async def update_timer(
    timer_data: TimerInOut,
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
):
    user = await repo.get_user(subject)

    if user is None:
        logger.warning(f"User not found for subject: {subject}")
        raise HTTPException(status_code=404, detail="User not found")

    user = await repo.update_timer(user, timer_data.model_dump())
    await manager.broadcast(user.email, "timer_updated", user.timer)

    return TimerInOut.model_validate(user.timer)
