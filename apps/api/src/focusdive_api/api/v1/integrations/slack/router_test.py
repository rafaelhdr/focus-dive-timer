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
