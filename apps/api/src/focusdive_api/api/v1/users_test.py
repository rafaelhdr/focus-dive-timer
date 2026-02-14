import asyncio
import re
from dataclasses import dataclass
from typing import Any

import pytest
from fastapi.testclient import TestClient

from focusdive_api.core.jwt import get_token_service
from focusdive_api.core.redis import get_redis
from focusdive_api.emails.deps import Mailer, get_mailer
from focusdive_api.main import app
from focusdive_api.users.repo import User, UserRepo, get_user_repo

EMAIL = "test@focusdive.app"


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
    def __init__(self):
        self.upserted = []

    async def get_user(self, subject: str) -> User | None:
        return User(
            id=subject,
            email=EMAIL,
            is_beta_user=False,
        )

    async def upsert_by_email(self, email: str) -> User:
        self.upserted.append(email)
        return User(
            id="user_123",
            email=email,
            is_beta_user=False,
        )


class FakeTokenService:
    def create_access_token(self, *, user_id: str) -> str:
        return f"access:{user_id}"

    def decode_access_token(self, token: str) -> dict:
        if token.startswith("access:"):
            return {"sub": token[len("access:"):]}
        raise ValueError("Invalid token")

    def issue_token_pair(self, *, user_id: str):
        return TokenPair(
            access_token=f"access:{user_id}", refresh_token=f"refresh:{user_id}"
        )


@pytest.fixture
def client():
    fake_redis = FakeRedis()
    fake_mailer = FakeMailer()
    fake_tokens = FakeTokenService()
    fake_user_repo = FakeUserRepo()

    app.dependency_overrides[get_redis] = lambda: fake_redis
    app.dependency_overrides[get_mailer] = lambda: fake_mailer
    app.dependency_overrides[get_token_service] = lambda: fake_tokens
    app.dependency_overrides[get_user_repo] = lambda: fake_user_repo

    with TestClient(app) as c:
        yield c, fake_redis, fake_mailer, fake_tokens, fake_user_repo

    app.dependency_overrides.clear()


class TestLogin:
    def test_auth_login_sends_code_and_stores_in_redis(self, client) -> None:
        client, fake_redis, fake_mailer, _, _ = client

        client = TestClient(app)

        res = client.post("/v1/users/login", json={"email": EMAIL})
        assert res.status_code == 200

        data = res.json()
        assert data.get("message") == "Verification code sent"

        assert len(fake_mailer.sent) == 1
        assert fake_mailer.sent[0]["email"] == EMAIL

        code = fake_mailer.sent[0]["code"]
        assert isinstance(code, str)
        assert re.fullmatch(r"\d{6}", code) is not None

        redis_key = f"login_code:{EMAIL}"
        stored_code = asyncio.run(fake_redis.get(redis_key))
        assert stored_code == code

        assert redis_key in fake_redis.expirations

    def test_auth_login_rejects_invalid_email(self, client) -> None:
        client, _, fake_mailer, _, _ = client

        client = TestClient(app)

        res = client.post("/v1/users/login", json={"email": "not-an-email"})
        assert res.status_code == 422

        assert fake_mailer.sent == []


class TestVerify:
    def test_verify_no_active_login(self, client):
        c, _, _, _, fake_repo = client

        res = c.post("/v1/users/verify",
                     json={"email": EMAIL, "token": "123456"})
        assert res.status_code == 400
        assert res.json()["detail"] == "No active login"

        assert fake_repo.upserted == []

    def test_verify_invalid_token_increments_attempts(self, client):
        c, fake_redis, _, _, fake_repo = client

        asyncio.run(fake_redis.set(f"login_code:{EMAIL}", "111111", ex=300))

        res = c.post("/v1/users/verify",
                     json={"email": EMAIL, "token": "222222"})
        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid token"

        attempts = asyncio.run(fake_redis.get(f"login_attempts:{EMAIL}"))
        assert attempts == "1"
        assert fake_repo.upserted == []

    def test_verify_too_many_attempts_deletes_keys(self, client):
        c, fake_redis, _, _, fake_repo = client

        code_key = f"login_code:{EMAIL}"
        attempts_key = f"login_attempts:{EMAIL}"

        asyncio.run(fake_redis.set(code_key, "111111", ex=300))
        fake_redis._attempts[attempts_key] = 5
        fake_redis.data[attempts_key] = "5"

        res = c.post("/v1/users/verify",
                     json={"email": EMAIL, "token": "000000"})
        assert res.status_code == 403
        assert res.json()["detail"] == "Too many attempts"

        assert asyncio.run(fake_redis.get(code_key)) is None
        assert asyncio.run(fake_redis.get(attempts_key)) is None
        assert fake_repo.upserted == []

    def test_verify_success_returns_tokens_clears_redis_and_upserts(self, client):
        c, fake_redis, _, _, fake_repo = client

        code_key = f"login_code:{EMAIL}"
        attempts_key = f"login_attempts:{EMAIL}"

        asyncio.run(fake_redis.set(code_key, "123456", ex=300))

        res = c.post("/v1/users/verify",
                     json={"email": EMAIL, "token": "123456"})
        assert res.status_code == 200

        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["access_token"].startswith("access:")
        assert data["refresh_token"].startswith("refresh:")

        assert asyncio.run(fake_redis.get(code_key)) is None
        assert asyncio.run(fake_redis.get(attempts_key)) is None

        assert fake_repo.upserted == [EMAIL]


class TestMe:
    def test_users_me_requires_auth(self) -> None:
        client = TestClient(app)
        res = client.get("/v1/users/me")
        assert res.status_code in (401, 403)

    def test_users_me_rejects_invalid_token(self) -> None:
        client = TestClient(app)
        res = client.get(
            "/v1/users/me", headers={"Authorization": "Bearer nope"})
        assert res.status_code == 401

    def test_users_me_returns_ok_with_valid_token(self, client) -> None:
        client, _, _, fake_tokens, _ = client

        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.get(
            "/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

        data = res.json()
        assert data.get("email") == EMAIL
