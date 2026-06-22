import logging
import math
from datetime import UTC, datetime

from focusdive_api.services.slack.client import get_slack_client
from focusdive_api.services.slack.schemas import DEFAULT_DND_EMOJI, DEFAULT_DND_TEXT
from focusdive_api.services.slack.service import (
    SlackServiceProtocol,
    build_slack_service,
)
from focusdive_api.timer.schemas import DEFAULT_TIMER, TimerMode, TimerState
from focusdive_api.users.repo import User, UserRepo

slack_client = get_slack_client()
slack_service = build_slack_service(slack_client)

logger = logging.getLogger(__name__)


async def load_timer(user: User | None) -> TimerState:
    if user:
        return user.timer or DEFAULT_TIMER
    return DEFAULT_TIMER


async def persist_timer(repo: UserRepo, user: User | None, timer: TimerState) -> None:
    if user:
        await repo.update_timer(user, timer)


async def on_trigger(
    *,
    user: User,
    ends_at: int | None,
    mode: TimerMode,
    slack_service: SlackServiceProtocol = slack_service,
) -> None:
    is_slack_enabled = await slack_service.get_is_enabled(user)

    if not is_slack_enabled:
        logger.info(f"Slack integration not enabled for user {user.email}")
        return
    if not user.integrations.slack or not user.integrations.slack.slack_token:
        logger.info(f"Slack integration not properly configured for user {user.email}")
        return

    slack_token = user.integrations.slack.slack_token
    slack_prefs = (user.preferences or {}).get("slack", {})
    dnd_text = slack_prefs.get("dnd_text", DEFAULT_DND_TEXT)
    dnd_emoji = slack_prefs.get("dnd_emoji", DEFAULT_DND_EMOJI)

    if mode == "focus" and ends_at is not None:
        now_ms = int(datetime.now(UTC).timestamp() * 1000)
        duration_minutes = max(1, math.ceil((ends_at - now_ms) / 1000 / 60))
        await slack_service.start_focus(
            user_reference=user.email,
            duration_minutes=duration_minutes,
            user_token=slack_token,
            dnd_text=dnd_text,
            dnd_emoji=dnd_emoji,
        )
    else:
        await slack_service.stop_focus(
            user_reference=user.email,
            user_token=slack_token,
        )
