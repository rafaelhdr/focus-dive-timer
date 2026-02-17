from dataclasses import dataclass

import pytest
from fastapi.testclient import TestClient

from focusdive_api.core.jwt import get_token_service
from focusdive_api.core.redis import get_redis
from focusdive_api.emails.deps import get_mailer
from focusdive_api.main import app
from focusdive_api.testing.fakes import (
    FakeMailer,
    FakeRedis,
    FakeTokenService,
    FakeUserRepo,
)
from focusdive_api.users.repo import get_user_repo

EMAIL = "test@focusdive.app"


@pytest.fixture
def email():
    return EMAIL


@dataclass
class TestContext:
    client: TestClient
    redis: FakeRedis
    mailer: FakeMailer
    tokens: FakeTokenService
    user_repo: FakeUserRepo


@pytest.fixture
def ctx():
    fake_redis = FakeRedis()
    fake_mailer = FakeMailer()
    fake_tokens = FakeTokenService()
    fake_user_repo = FakeUserRepo(EMAIL)

    app.dependency_overrides[get_redis] = lambda: fake_redis
    app.dependency_overrides[get_mailer] = lambda: fake_mailer
    app.dependency_overrides[get_token_service] = lambda: fake_tokens
    app.dependency_overrides[get_user_repo] = lambda: fake_user_repo

    with TestClient(app) as c:
        yield TestContext(
            client=c,
            redis=fake_redis,
            mailer=fake_mailer,
            tokens=fake_tokens,
            user_repo=fake_user_repo,
        )

    app.dependency_overrides.clear()
