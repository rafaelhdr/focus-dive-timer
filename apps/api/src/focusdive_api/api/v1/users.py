import secrets

from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis

from focusdive_api.core.auth import get_current_subject
from focusdive_api.core.redis import get_redis
from focusdive_api.core.settings import settings
from focusdive_api.emails.deps import Mailer, get_mailer
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import LoginIn, LoginOut, MeOut

router = APIRouter(tags=["users"])


@router.post("/login")
async def login(
    payload: LoginIn,
    redis: Redis = Depends(get_redis),
    mailer: Mailer = Depends(get_mailer),
) -> LoginOut:
    email = payload.email
    code = str(secrets.randbelow(900000) + 100000)

    await redis.set(
        f"login_code:{email}",
        code,
        ex=settings.login_code_ttl_seconds,
    )

    await mailer.send_login_code(email, code)

    return LoginOut(message="Verification code sent")


@router.get("/me", response_model=MeOut)
async def me(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> MeOut:
    user = await repo.get_user(subject)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return MeOut.model_validate(user)
