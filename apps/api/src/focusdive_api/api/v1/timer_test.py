class TestUpdateTimer:
    def test_update_timer_requires_auth(self, ctx) -> None:
        client = ctx.client

        res = client.put(
            "/v1/timer",
            json={
                "is_running": True,
                "ends_at": None,
                "mode": "focus",
                "remaining_time": 300,
            },
        )
        assert res.status_code in (401, 403)

    def test_update_timer_returns_ok_with_valid_token(self, ctx) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        TIMER_DATA = {
            "is_running": True,
            "ends_at": None,
            "mode": "focus",
            "remaining_time": 300,
        }
        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.put(
            "/v1/timer",
            headers={"Authorization": f"Bearer {token}"},
            json=TIMER_DATA,
        )
        assert res.status_code == 200

        data = res.json()
        assert data == TIMER_DATA
