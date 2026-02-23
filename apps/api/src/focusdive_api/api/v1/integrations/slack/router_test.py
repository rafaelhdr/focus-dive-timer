import asyncio

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
            json={"action": "start", "dnd_text": "Testing DND", "dnd_emoji": ":no_bell:"},
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
