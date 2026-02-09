from datetime import datetime, timedelta, timezone

from jose import jwt

from focusdive_api.core.settings import settings


def create_access_token(*, user_id: str, expires_minutes: int | None = None) -> str:
    exp_minutes = (
        expires_minutes if expires_minutes is not None else settings.jwt_exp_minutes
    )
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_minutes)).timestamp()),
    }
    return jwt.encode(
        payload,
        settings.jwt_secret.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.jwt_secret.get_secret_value(),
        algorithms=[settings.jwt_algorithm],
    )
