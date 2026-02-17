class TestPreferences:
    def test_preferences_requires_auth(self, ctx) -> None:
        client = ctx.client

        res = client.get("/v1/preferences")
        assert res.status_code in (401, 403)

    def test_preferences_returns_ok_with_valid_token(self, ctx) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.get(
            "/v1/preferences", headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200

        data = res.json()
        assert isinstance(data, dict)
