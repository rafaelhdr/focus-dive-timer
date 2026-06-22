from focusdive_api.users.repo import DEFAULT_PREFERENCES


class TestGetPreferences:
    def test_preferences_requires_auth(self, ctx) -> None:
        client = ctx.client

        res = client.get("/v1/preferences")
        assert res.status_code in (401, 403)

    def test_preferences_returns_ok_with_valid_token(self, ctx) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.get("/v1/preferences", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

        data = res.json()
        assert data == DEFAULT_PREFERENCES


class TestUpdatePreferences:
    def test_update_preferences_requires_auth(self, ctx) -> None:
        client = ctx.client

        res = client.put("/v1/preferences", json={"theme": "dark"})
        assert res.status_code in (401, 403)

    def test_update_preferences_returns_ok_with_valid_token(self, ctx) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        new_preferences = {
            "focus_beep_enabled": False,
            "focus_beep_volume": 50,
            "alarm_sound": "level",
            "autostart_break": False,
            "autostart_focus": False,
            "default_focus_duration": 20,
            "default_break_duration": 4,
        }
        token = fake_tokens.create_access_token(user_id="user_123")

        res = client.put(
            "/v1/preferences",
            headers={"Authorization": f"Bearer {token}"},
            json=new_preferences,
        )
        assert res.status_code == 200

        data = res.json()
        assert data == new_preferences
