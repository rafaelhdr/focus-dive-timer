from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException

from focusdive_api.emails.deps import Mailer
from focusdive_api.users.repo import User, UserRepo


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str


class FakeRedis:
    def __init__(self) -> None:
        self.data: dict[str, str] = {}
        self.expirations: dict[str, int] = {}
        self._attempts: dict[str, int] = {}

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        self.data[key] = value
        if ex is not None:
            self.expirations[key] = ex

    async def get(self, key: str) -> str | None:
        return self.data.get(key)

    async def delete(self, *keys: str) -> int:
        deleted = 0
        for key in keys:
            if key in self.data:
                deleted += 1
            self.data.pop(key, None)
            self.expirations.pop(key, None)
            self._attempts.pop(key, None)
        return deleted

    async def incr(self, key):
        self._attempts[key] = int(self._attempts.get(key, 0)) + 1
        self.data[key] = str(self._attempts[key])
        return self._attempts[key]

    async def ttl(self, key):
        return self.expirations.get(key, -1)

    async def expire(self, key, ttl):
        self.expirations[key] = ttl
        return True


class FakeMailer(Mailer):
    def __init__(self) -> None:
        self.sent: list[dict[str, Any]] = []

    async def send_login_code(self, email: str, code: str) -> None:
        self.sent.append({"email": email, "code": code})


class FakeUserRepo(UserRepo):
    def __init__(self, email: str) -> None:
        self.upserted = []
        self.email = email

    async def get_user(self, subject: str) -> User | None:
        return User(
            id=subject,
            email=self.email,
            is_beta_user=False,
            preferences={},
        )

    async def upsert_by_email(self, email: str) -> User:
        self.upserted.append(email)
        return User(
            id="user_123",
            email=email,
            is_beta_user=False,
            preferences={},
        )


class FakeTokenService:
    def create_access_token(self, *, user_id: str) -> str:
        return f"access:{user_id}"

    def create_refresh_token(self, *, user_id: str) -> str:
        return f"access:{user_id}"

    def decode_token(self, token: str) -> dict:
        if token.startswith("access:"):
            return {"sub": token[len("access:") :]}
        raise HTTPException(status_code=401, detail="Invalid token")

    def issue_token_pair(self, *, user_id: str):
        return TokenPair(
            access_token=f"access:{user_id}", refresh_token=f"refresh:{user_id}"
        )
