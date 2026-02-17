import asyncio
import re


class TestLogin:
    def test_auth_login_sends_code_and_stores_in_redis(self, ctx, email) -> None:
        client = ctx.client
        fake_redis = ctx.redis
        fake_mailer = ctx.mailer

        res = client.post("/v1/users/login", json={"email": email})
        assert res.status_code == 200

        data = res.json()
        assert data.get("message") == "Verification code sent"

        assert len(fake_mailer.sent) == 1
        assert fake_mailer.sent[0]["email"] == email

        code = fake_mailer.sent[0]["code"]
        assert isinstance(code, str)
        assert re.fullmatch(r"\d{6}", code) is not None

        redis_key = f"login_code:{email}"
        stored_code = asyncio.run(fake_redis.get(redis_key))
        assert stored_code == code

        assert redis_key in fake_redis.expirations

    def test_auth_login_rejects_invalid_email(self, ctx) -> None:
        client = ctx.client
        fake_mailer = ctx.mailer

        res = client.post("/v1/users/login", json={"email": "not-an-email"})
        assert res.status_code == 422

        assert fake_mailer.sent == []


class TestVerify:
    def test_verify_no_active_login(self, ctx, email):
        client = ctx.client
        fake_repo = ctx.user_repo

        res = client.post("/v1/users/verify", json={"email": email, "token": "123456"})
        assert res.status_code == 400
        assert res.json()["detail"] == "No active login"

        assert fake_repo.upserted == []

    def test_verify_invalid_token_increments_attempts(self, ctx, email):
        client = ctx.client
        fake_redis = ctx.redis
        fake_repo = ctx.user_repo

        asyncio.run(fake_redis.set(f"login_code:{email}", "111111", ex=300))

        res = client.post("/v1/users/verify", json={"email": email, "token": "222222"})
        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid token"

        attempts = asyncio.run(fake_redis.get(f"login_attempts:{email}"))
        assert attempts == "1"
        assert fake_repo.upserted == []

    def test_verify_too_many_attempts_deletes_keys(self, ctx, email):
        client = ctx.client
        fake_redis = ctx.redis
        fake_repo = ctx.user_repo

        code_key = f"login_code:{email}"
        attempts_key = f"login_attempts:{email}"

        asyncio.run(fake_redis.set(code_key, "111111", ex=300))
        fake_redis._attempts[attempts_key] = 5
        fake_redis.data[attempts_key] = "5"

        res = client.post("/v1/users/verify", json={"email": email, "token": "000000"})
        assert res.status_code == 403
        assert res.json()["detail"] == "Too many attempts"

        assert asyncio.run(fake_redis.get(code_key)) is None
        assert asyncio.run(fake_redis.get(attempts_key)) is None
        assert fake_repo.upserted == []

    def test_verify_success_returns_tokens_clears_redis_and_upserts(self, ctx, email):
        client = ctx.client
        fake_redis = ctx.redis
        fake_repo = ctx.user_repo

        code_key = f"login_code:{email}"
        attempts_key = f"login_attempts:{email}"

        asyncio.run(fake_redis.set(code_key, "123456", ex=300))

        res = client.post("/v1/users/verify", json={"email": email, "token": "123456"})
        assert res.status_code == 200

        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["access_token"].startswith("access:")
        assert data["refresh_token"].startswith("refresh:")

        assert asyncio.run(fake_redis.get(code_key)) is None
        assert asyncio.run(fake_redis.get(attempts_key)) is None

        assert fake_repo.upserted == [email]


class TestRefreshToken:
    def test_refresh_token_missing_authorization(self, ctx):
        client = ctx.client

        res = client.post("/v1/users/refresh-token")
        assert res.status_code in (401, 403)

    def test_refresh_token_invalid_token(self, ctx):
        client = ctx.client

        res = client.post(
            "/v1/users/refresh-token",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert res.status_code == 401

    def test_refresh_token_success_returns_new_tokens(self, ctx):
        client = ctx.client
        fake_tokens = ctx.tokens

        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.post(
            "/v1/users/refresh-token",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200

        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data


class TestMe:
    def test_users_me_requires_auth(self, ctx) -> None:
        client = ctx.client

        res = client.get("/v1/users/me")
        assert res.status_code in (401, 403)

    def test_users_me_rejects_invalid_token(self, ctx) -> None:
        client = ctx.client
        res = client.get("/v1/users/me", headers={"Authorization": "Bearer nope"})
        assert res.status_code == 401

    def test_users_me_returns_ok_with_valid_token(self, ctx, email) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.get("/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

        data = res.json()
        assert data.get("email") == email
