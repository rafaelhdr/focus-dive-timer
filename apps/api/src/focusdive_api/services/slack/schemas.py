from typing import NotRequired, TypedDict

DEFAULT_DND_TEXT = "Focus!"
DEFAULT_DND_EMOJI = ":computer:"


class SlackTeamTokenResponse(TypedDict):
    name: str
    id: str


class SlackEnterpriseTokenResponse(TypedDict):
    name: str
    id: str


class SlackAuthedUserTokenResponse(TypedDict):
    id: str
    scope: str
    access_token: str
    token_type: str


class SlackOAuthAccessResponse(TypedDict):
    ok: bool
    access_token: str
    token_type: str
    scope: str
    bot_user_id: str
    app_id: str
    team: SlackTeamTokenResponse
    authed_user: SlackAuthedUserTokenResponse
    enterprise: NotRequired[SlackEnterpriseTokenResponse]
