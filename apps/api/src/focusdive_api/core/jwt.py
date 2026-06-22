from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Protocol

from jose import jwt

from focusdive_api.core.settings import settings


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str


class TokenService(Protocol):
    def create_access_token(self, *, user_id: str) -> str: ...
    def create_refresh_token(self, *, user_id: str) -> str: ...
    def issue_token_pair(self, *, user_id: str) -> TokenPair: ...
    def decode_token(self, token: str) -> dict: ...


class JwtTokenService:
    def create_access_token(self, *, user_id: str) -> str:
        now = datetime.now(UTC)
        payload = {
            "type": "access",
            "sub": user_id,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=settings.jwt_access_exp_minutes)).timestamp()),
        }
        return jwt.encode(
            payload,
            settings.jwt_secret.get_secret_value(),
            algorithm=settings.jwt_algorithm,
        )

    def create_refresh_token(self, *, user_id: str) -> str:
        now = datetime.now(UTC)
        payload = {
            "type": "refresh",
            "sub": user_id,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=settings.jwt_refresh_exp_days)).timestamp()),
        }
        return jwt.encode(
            payload,
            settings.jwt_secret.get_secret_value(),
            algorithm=settings.jwt_algorithm,
        )

    def issue_token_pair(self, *, user_id: str) -> TokenPair:
        return TokenPair(
            access_token=self.create_access_token(user_id=user_id),
            refresh_token=self.create_refresh_token(user_id=user_id),
        )

    def decode_token(self, token: str) -> dict:
        return jwt.decode(
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )


def get_token_service() -> JwtTokenService:
    return JwtTokenService()
