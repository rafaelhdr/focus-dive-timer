from fastapi import APIRouter, Depends, HTTPException

from focusdive_api.core.auth import get_current_subject
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import UserPreferencesInOut

router = APIRouter(tags=["preferences"])


@router.get("", response_model=UserPreferencesInOut)
async def get_preferences(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
):
    user = await repo.get_user(subject)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return UserPreferencesInOut.model_validate(user.preferences)


@router.put("", response_model=UserPreferencesInOut)
async def update_preferences(
    preferences: UserPreferencesInOut,
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
):
    user = await repo.get_user(subject)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user = await repo.update_preferences(user, preferences.model_dump())

    return UserPreferencesInOut.model_validate(user.preferences)
