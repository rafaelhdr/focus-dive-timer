from fastapi import APIRouter, Depends, HTTPException

from focusdive_api.core.auth import get_current_subject
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import MeOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=MeOut)
async def me(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> MeOut:
    user = await repo.get_user(subject)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return MeOut.model_validate(user)
