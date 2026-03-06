import logging
from typing import Protocol

from fastapi import Depends

from focusdive_api.users.repo import User

from .client import SlackClientProtocol, get_slack_client

logger = logging.getLogger(__name__)


class SlackServiceProtocol(Protocol):
    def __init__(self, slack_client: SlackClientProtocol) -> None: ...

    async def get_is_connected(self, user: User | None) -> bool: ...
    async def get_is_enabled(self, user: User) -> bool: ...

    async def start_focus(
        self,
        *,
        user_reference: str,
        duration_minutes: int,
        user_token: str,
        dnd_text: str,
        dnd_emoji: str,
    ) -> bool: ...

    async def stop_focus(
        self,
        *,
        user_reference: str,
        user_token: str,
    ) -> bool: ...


class SlackService:
    def __init__(self, slack_client: SlackClientProtocol) -> None:
        self.slack_client = slack_client

    async def get_is_connected(self, user: User | None) -> bool:
        return bool(
            user and user.integrations.slack and user.integrations.slack.slack_token
        )

    async def get_is_enabled(self, user: User) -> bool:
        return bool(user.integrations.slack and user.integrations.slack.slack_token)

    async def start_focus(
        self,
        *,
        user_reference: str,
        duration_minutes: int,
        user_token: str,
        dnd_text: str,
        dnd_emoji: str,
    ) -> bool:
        slack_client = self.slack_client
        if not user_reference or not user_token or not dnd_text or not dnd_emoji:
            logger.info(
                "Missing required parameters for starting focus time. user_reference: %s, user_token: (%s forced bool), dnd_text: %s, dnd_emoji: %s",
                user_reference,
                bool(user_token),
                dnd_text,
                dnd_emoji,
            )
            return False
        logger.info(
            f"Starting focus time for user {user_reference} with duration {duration_minutes} minutes."
        )
        result = await slack_client.dnd_start(
            user_reference=user_reference,
            duration_minutes=duration_minutes,
            user_token=user_token,
            dnd_text=dnd_text,
            dnd_emoji=dnd_emoji,
        )
        return result

    async def stop_focus(
        self,
        *,
        user_reference: str,
        user_token: str,
    ) -> bool:
        slack_client = self.slack_client
        if not user_reference or not user_token:
            logger.info(
                "Missing required parameters for stopping focus time. user_reference: %s, user_token: (%s forced bool)",
                user_reference,
                bool(user_token),
            )
            return False
        logger.info(f"Stopping focus time for user {user_reference}.")
        return await slack_client.dnd_end(
            user_reference=user_reference,
            user_token=user_token,
        )


def build_slack_service(slack_client: SlackClientProtocol) -> SlackServiceProtocol:
    return SlackService(slack_client=slack_client)


def get_slack_service(
    slack_client: SlackClientProtocol = Depends(get_slack_client),
) -> SlackServiceProtocol:
    return build_slack_service(slack_client)
