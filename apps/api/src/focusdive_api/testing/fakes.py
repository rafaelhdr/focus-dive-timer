from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException

from focusdive_api.emails.deps import Mailer
from focusdive_api.users.repo import DEFAULT_PREFERENCES, User, UserRepo, Integrations, SlackIntegration


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
    def __init__(self, email: str, slack_token: str) -> None:
        self.upserted = []
        self.email = email
        self.slack_token = slack_token

    def _integrations(self) -> Integrations:
        slack = SlackIntegration(slack_token=self.slack_token) if self.slack_token else None
        return Integrations(slack=slack)

    async def get_user(self, subject: str) -> User | None:
        return User(
            id=subject,
            email=self.email,
            is_beta_user=False,
            preferences=DEFAULT_PREFERENCES,
            integrations=self._integrations(),
            timer={},
        )

    async def upsert_by_email(self, email: str) -> User:
        self.upserted.append(email)
        return User(
            id="user_123",
            email=email,
            is_beta_user=False,
            preferences=DEFAULT_PREFERENCES,
            integrations=self._integrations(),
            timer={},
        )

    async def update_preferences(self, user: User, new_prefs: dict) -> User:
        return User(
            id=user.id,
            email=user.email,
            is_beta_user=user.is_beta_user,
            preferences=new_prefs,
            integrations=self._integrations(),
            timer={},
        )

    async def update_timer(self, user: User, new_timer: dict) -> User:
        return User(
            id=user.id,
            email=user.email,
            is_beta_user=user.is_beta_user,
            preferences=user.preferences,
            integrations=self._integrations(),
            timer=new_timer,
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


class FakeSlackService:
    connected_for_user_id: dict[str, bool] = {}

    def __init__(self):
        self.connected_for_user_id = {}
        self.start_calls = []
        self.stop_calls = []

    async def get_is_connected(self, user) -> bool:
        return self.connected_for_user_id.get(user.email, False)

    async def start_focus(self, **kwargs) -> bool:
        self.start_calls.append(kwargs)
        return True

    async def stop_focus(self, **kwargs) -> bool:
        self.stop_calls.append(kwargs)
        return True
