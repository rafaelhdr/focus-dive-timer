import asyncio


class TestSlackConnect:
    def test_slack_connect_requires_auth(self, ctx) -> None:
        res = ctx.client.post(
            "/v1/integrations/slack/connect",
            json={"code": "abc123"},
        )
        assert res.status_code in (401, 403)

    def test_slack_connect_returns_400_when_code_is_invalid(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        ctx.slack.exchange_response = {
            "ok": False,
            "error": "invalid_code",
        }

        res = ctx.client.post(
            "/v1/integrations/slack/connect",
            json={"code": "bad-code"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert res.status_code == 400
        assert res.json() == {"detail": "Invalid Slack code"}
        assert ctx.slack.exchange_calls == ["bad-code"]

    def test_slack_connect_returns_400_when_token_data_is_missing(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        ctx.slack.exchange_response = {
            "ok": True,
            "team": {"id": "T123"},
            "authed_user": {
                "id": "U123",
                # missing access_token
            },
        }

        res = ctx.client.post(
            "/v1/integrations/slack/connect",
            json={"code": "abc123"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert res.status_code == 400
        assert res.json() == {"detail": "Missing Slack token data"}

    def test_slack_connect_saves_slack_data_and_returns_ok(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        ctx.slack.exchange_response = {
            "ok": True,
            "team": {"id": "T999"},
            "authed_user": {
                "id": "U999",
                "access_token": "xoxp-999",
            },
        }

        res = ctx.client.post(
            "/v1/integrations/slack/connect",
            json={"code": "good-code"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert res.status_code == 200
        assert res.json() == {"status": "ok"}
        assert ctx.slack.exchange_calls == ["good-code"]


class TestSlackDisconnect:
    def test_slack_disconnect_requires_auth(self, ctx) -> None:
        res = ctx.client.post("/v1/integrations/slack/disconnect")
        assert res.status_code in (401, 403)

    def test_slack_disconnect_returns_400_when_not_connected(self, ctx) -> None:
        ctx.user_repo.slack_token = ""
        token = ctx.tokens.create_access_token(user_id="user_123")

        res = ctx.client.post(
            "/v1/integrations/slack/disconnect",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert res.status_code == 400
        assert res.json() == {"detail": "Slack is not connected"}

    def test_slack_disconnect_clears_slack_data_and_returns_ok(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")

        user = asyncio.run(ctx.user_repo.get_user("user_123"))
        user = asyncio.run(
            ctx.user_repo.update_slack_connection(
                user=user,
                slack_token="xoxp-999",
            )
        )

        assert user.integrations.slack.slack_token

        res = ctx.client.post(
            "/v1/integrations/slack/disconnect",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert res.status_code == 200
        assert res.json() == {"status": "ok"}

        user = asyncio.run(ctx.user_repo.get_user("user_123"))
        assert user is not None
        assert not user.integrations.slack


class TestSlackStatus:
    def test_slack_status_requires_auth(self, ctx) -> None:
        res = ctx.client.get("/v1/integrations/slack/status")
        assert res.status_code in (401, 403)

    def test_slack_status_returns_false_when_not_connected(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")

        res = ctx.client.get(
            "/v1/integrations/slack/status",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert res.json() == {"is_connected": False}

    def test_slack_status_returns_true_when_connected(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        user = asyncio.run(ctx.user_repo.get_user("user_123"))
        ctx.slack.connected_for_user_id[user.email] = True

        res = ctx.client.get(
            "/v1/integrations/slack/status",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert res.json() == {"is_connected": True}


class TestSlackTestEndpoint:
    def test_slack_test_requires_auth(self, ctx) -> None:
        res = ctx.client.post("/v1/integrations/slack/test", json={"action": "start"})
        assert res.status_code in (401, 403)

    def test_slack_test_returns_not_connected(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")

        res = ctx.client.post(
            "/v1/integrations/slack/test",
            headers={"Authorization": f"Bearer {token}"},
            json={"action": "start"},
        )
        assert res.status_code == 200
        assert res.json() == {
            "success": False,
            "message": "Slack integration not connected",
        }

    def test_slack_test_returns_not_configured_when_missing_token(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        user = asyncio.run(ctx.user_repo.get_user("user_123"))

        ctx.user_repo.slack_token = None
        ctx.slack.connected_for_user_id[user.email] = True

        res = ctx.client.post(
            "/v1/integrations/slack/test",
            headers={"Authorization": f"Bearer {token}"},
            json={"action": "start"},
        )
        assert res.status_code == 200
        assert res.json() == {
            "success": False,
            "message": "Slack integration not properly configured",
        }

    def test_slack_test_start_calls_start_focus(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        user = asyncio.run(ctx.user_repo.get_user("user_123"))
        ctx.slack.connected_for_user_id[user.email] = True

        called = {}

        async def fake_start_focus(**kwargs):
            called.update(kwargs)
            return True

        ctx.slack.start_focus = fake_start_focus

        res = ctx.client.post(
            "/v1/integrations/slack/test",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "action": "start",
                "dnd_text": "Testing DND",
                "dnd_emoji": ":no_bell:",
            },
        )

        assert res.status_code == 200
        assert res.json() == {"success": True, "message": None}

        assert called["user_reference"] == "user_123"

    def test_slack_test_stop_calls_stop_focus(self, ctx) -> None:
        token = ctx.tokens.create_access_token(user_id="user_123")
        user = asyncio.run(ctx.user_repo.get_user("user_123"))
        ctx.slack.connected_for_user_id[user.email] = True

        called = {}

        async def fake_stop_focus(**kwargs):
            called.update(kwargs)
            return True

        ctx.slack.stop_focus = fake_stop_focus

        res = ctx.client.post(
            "/v1/integrations/slack/test",
            headers={"Authorization": f"Bearer {token}"},
            json={"action": "stop"},
        )

        assert res.status_code == 200
        assert res.json() == {"success": True, "message": None}

        assert called["user_reference"] == "user_123"
