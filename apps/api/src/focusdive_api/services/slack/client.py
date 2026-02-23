import logging
from typing import Protocol

import httpx

from focusdive_api.core.settings import settings

logger = logging.getLogger(__name__)


class SlackClientProtocol(Protocol):
    async def dnd_start(
        self,
        *,
        user_reference: str,
        duration_minutes: int,
        user_token: str,
        dnd_text: str,
        dnd_emoji: str,
    ) -> bool: ...

    async def dnd_end(self, *, user_reference: str, user_token: str) -> bool: ...


class SlackClient:
    async def dnd_start(
        self,
        *,
        user_reference: str,
        duration_minutes: int,
        user_token: str,
        dnd_text: str,
        dnd_emoji: str,
    ) -> bool:
        if settings.debug:
            logger.info(
                f"No real Slack API calls will be made in debug mode. This is a no-op for testing purposes. Called with user_reference: {user_reference}, duration_minutes: {duration_minutes}, user_token: ({bool(user_token)} forced bool), dnd_text: {dnd_text}, dnd_emoji: {dnd_emoji}"
            )
            return True
        headers = {
            "Authorization": f"Bearer {user_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            logger.info(dnd_emoji)
            response_profile_set = await client.post(
                "https://slack.com/api/users.profile.set",
                headers=headers,
                json={
                    "profile": {
                        "status_text": dnd_text,
                        "status_emoji": dnd_emoji,
                        "status_expiration": 0,
                    }
                },
            )

            response_dnd_start = await client.post(
                "https://slack.com/api/dnd.setSnooze",
                headers={"Authorization": f"Bearer {user_token}"},
                data={"num_minutes": duration_minutes},
            )

            if not response_profile_set.is_success or not response_dnd_start.is_success:
                logger.warning(
                    f"Failed to start DND for user {user_reference}. Response profile set: {response_profile_set.text}, Response DND start: {response_dnd_start.text}"
                )
                return False

        return True

    async def dnd_end(self, *, user_reference: str, user_token: str) -> bool:
        if settings.debug:
            logger.info(
                "No real Slack API calls will be made in debug mode. This is a no-op for testing purposes."
            )
            logger.info(
                f"SlackClient.dnd_end called with user_reference: {user_reference}, user_token: ({bool(user_token)} forced bool"
            )
            return True
        headers = {
            "Authorization": f"Bearer {user_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response_profile_set = await client.post(
                "https://slack.com/api/users.profile.set",
                headers=headers,
                json={
                    "profile": {
                        "status_text": "",
                        "status_emoji": "",
                        "status_expiration": 0,
                    }
                },
            )

            response_dnd_end = await client.post(
                "https://slack.com/api/dnd.endDnd",
                headers={"Authorization": f"Bearer {user_token}"},
            )

            if not response_profile_set.is_success or not response_dnd_end.is_success:
                logger.warning(
                    f"Failed to end DND for user {user_reference}. Response profile set: {response_profile_set.text}, Response DND end: {response_dnd_end.text}"
                )
                return False
        return True


def get_slack_client() -> SlackClientProtocol:
    return SlackClient()
