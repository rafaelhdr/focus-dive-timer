from focusdive_api.timer.schemas import DEFAULT_TIMER


class TestTimerWebSocket:
    def test_ws_get_timer_returns_timer_state(self, ctx, monkeypatch) -> None:
        client = ctx.client
        fake_tokens = ctx.tokens

        token = fake_tokens.create_access_token(user_id="user_123")

        async def fake_load_timer(_):
            return DEFAULT_TIMER

        monkeypatch.setattr(
            "focusdive_api.ws.timer_service.load_timer",
            fake_load_timer,
        )

        with client.websocket_connect(f"/ws/timer?token={token}") as ws:
            ws.send_json({"event": "get_timer"})
            msg = ws.receive_json()

        assert msg["event"] == "timer_state"
        assert msg["data"] == DEFAULT_TIMER
