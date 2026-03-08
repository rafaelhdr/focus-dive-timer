from typing import Literal

from pydantic import BaseModel


class SlackConnectIn(BaseModel):
    code: str


class SlackConnectOut(BaseModel):
    status: str


class SlackDisconnectOut(BaseModel):
    status: str


class SlackStatusOut(BaseModel):
    is_connected: bool


class SlackTestIn(BaseModel):
    action: Literal["start", "stop"]
    dnd_text: str | None = None
    dnd_emoji: str | None = None


class SlackTestOut(BaseModel):
    success: bool
    message: str | None = None


class SlackPreferencesInOut(BaseModel):
    slack_enabled: bool
    slack_dnd_emoji: str
    slack_dnd_text: str
