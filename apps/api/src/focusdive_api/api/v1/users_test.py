import asyncio
import re
from typing import Any

import pytest
from fastapi.testclient import TestClient

from focusdive_api.core.jwt import create_access_token
from focusdive_api.core.redis import get_redis
from focusdive_api.emails.deps import Mailer, get_mailer
from focusdive_api.main import app
from focusdive_api.users.repo import User, UserRepo, get_user_repo

EMAIL = "test@focusdive.app"


class FakeRedis:
    def __init__(self) -> None:
        self.data: dict[str, str] = {}
        self.expirations: dict[str, int] = {}

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        self.data[key] = value
        if ex is not None:
            self.expirations[key] = ex

    async def get(self, key: str) -> str | None:
        return self.data.get(key)

    async def delete(self, key: str) -> None:
        self.data.pop(key, None)
        self.expirations.pop(key, None)


class FakeMailer(Mailer):
    def __init__(self) -> None:
        self.sent: list[dict[str, Any]] = []

    async def send_login_code(self, email: str, code: str) -> None:
        self.sent.append({"email": email, "code": code})


class FakeUserRepo(UserRepo):
    async def get_user(self, subject: str) -> User | None:
        return User(
            id=subject,
            email=EMAIL,
            is_beta_user=False,
        )


@pytest.fixture
def client():
    fake_redis = FakeRedis()
    fake_mailer = FakeMailer()

    app.dependency_overrides[get_redis] = lambda: fake_redis
    app.dependency_overrides[get_mailer] = lambda: fake_mailer

    with TestClient(app) as c:
        yield c, fake_redis, fake_mailer

    app.dependency_overrides.clear()


class TestLogin:
    def test_auth_login_sends_code_and_stores_in_redis(self, client) -> None:
        client, fake_redis, fake_mailer = client

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
        client, _, fake_mailer = client

        client = TestClient(app)

        res = client.post("/v1/users/login", json={"email": "not-an-email"})
        assert res.status_code == 422

        assert fake_mailer.sent == []


class TestMe:
    def test_users_me_requires_auth(self) -> None:
        client = TestClient(app)
        res = client.get("/v1/users/me")
        assert res.status_code in (401, 403)

    def test_users_me_rejects_invalid_token(self) -> None:
        client = TestClient(app)
        res = client.get("/v1/users/me", headers={"Authorization": "Bearer nope"})
        assert res.status_code == 401

    def test_users_me_returns_ok_with_valid_token(self) -> None:
        if get_user_repo is not None:
            app.dependency_overrides[get_user_repo] = lambda: FakeUserRepo()

        client = TestClient(app)
        token = create_access_token(user_id="user_123", expires_minutes=2)

        res = client.get("/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

        data = res.json()
        assert data.get("email") == EMAIL

        app.dependency_overrides.clear()
