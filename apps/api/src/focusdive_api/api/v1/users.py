import asyncio
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis

from focusdive_api.core.auth import get_current_subject
from focusdive_api.core.jwt import TokenService, get_token_service
from focusdive_api.core.redis import get_redis
from focusdive_api.core.settings import settings
from focusdive_api.emails.deps import Mailer, get_mailer
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import LoginIn, LoginOut, MeOut, VerifyIn, VerifyOut

MAX_ATTEMPTS = 5

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


@router.post("/verify", response_model=VerifyOut)
async def verify(
    payload: VerifyIn,
    redis: Redis = Depends(get_redis),
    tokens: TokenService = Depends(get_token_service),
    repo: UserRepo = Depends(get_user_repo),
) -> VerifyOut:
    email = payload.email
    token = payload.token

    code_key = f"login_code:{email}"
    attempts_key = f"login_attempts:{email}"

    stored_code = await redis.get(code_key)
    if not stored_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active login",
        )

    if isinstance(stored_code, (bytes, bytearray)):
        stored_code = stored_code.decode("utf-8")

    attempts = await redis.incr(attempts_key)

    if attempts == 1:
        ttl = await redis.ttl(code_key)
        if ttl and ttl > 0:
            await redis.expire(attempts_key, ttl)

    if attempts > MAX_ATTEMPTS:
        await redis.delete(code_key, attempts_key)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Too many attempts",
        )

    if token != stored_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    token_pair = tokens.issue_token_pair(user_id=email)
    access = token_pair.access_token
    refresh = token_pair.refresh_token

    await asyncio.gather(
        redis.delete(code_key, attempts_key), repo.upsert_by_email(email)
    )

    return VerifyOut(access_token=access, refresh_token=refresh)


@router.get("/me", response_model=MeOut)
async def me(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> MeOut:
    user = await repo.get_user(subject)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return MeOut.model_validate(user)
