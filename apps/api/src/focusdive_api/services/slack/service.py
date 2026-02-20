from focusdive_api.users.repo import User
from typing import Protocol


class SlackServiceProtocol(Protocol):
    async def get_is_connected(self, user: User | None) -> bool: ...


class SlackService:
    async def get_is_connected(self, user: User | None) -> bool:
        return bool(user and user.integrations.slack and user.integrations.slack.slack_token)


def get_slack_service() -> SlackServiceProtocol:
    return SlackService()
