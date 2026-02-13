from fastapi.testclient import TestClient

from focusdive_api.core.jwt import create_access_token
from focusdive_api.main import app
from focusdive_api.users.repo import User, UserRepo, get_user_repo

EMAIL = "test@focusdive.app"


class FakeUserRepo(UserRepo):
    async def get_user(self, subject: str) -> User | None:
        return User(
            id=subject,
            email=EMAIL,
            is_beta_user=False,
        )


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
