import logging

from fastapi import APIRouter, Depends, HTTPException, status

from focusdive_api.core.auth import get_current_subject
from focusdive_api.services.slack.service import SlackServiceProtocol, get_slack_service
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import (
    SlackConnectIn,
    SlackConnectOut,
    SlackDisconnectOut,
    SlackPreferencesInOut,
    SlackStatusOut,
    SlackTestIn,
    SlackTestOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/slack", tags=["integrations:slack"])


@router.post("/connect", response_model=SlackConnectOut)
async def slack_connect(
    payload: SlackConnectIn,
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
    slack_service: SlackServiceProtocol = Depends(get_slack_service),
) -> SlackConnectOut:
    user = await repo.get_user(subject)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    tokens = await slack_service.exchange_code_for_token(payload.code)

    if not tokens.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Slack code",
        )

    authed_user = tokens.get("authed_user") or {}
    team = tokens.get("team") or {}

    user_token = authed_user.get("access_token")
    authed_user_id = authed_user.get("id")
    team_id = team.get("id")

    if (
        not user_token or not authed_user_id or not team_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Slack token data",
        )

    await repo.update_slack_connection(
        user=user,
        slack_token=user_token,
    )

    return SlackConnectOut(status="ok")


@router.post("/disconnect", response_model=SlackDisconnectOut)
async def slack_disconnect(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> SlackDisconnectOut:
    user = await repo.get_user(subject)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    slack = user.integrations.slack if user.integrations else None
    is_connected = bool(slack and slack.slack_token)

    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slack is not connected",
        )

    await repo.update_slack_connection(
        user=user,
        slack_token="",
    )

    return SlackDisconnectOut(status="ok")


@router.get("/status", response_model=SlackStatusOut)
async def slack_status(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
    slack_service: SlackServiceProtocol = Depends(get_slack_service),
) -> SlackStatusOut:
    user = await repo.get_user(subject)
    is_connected = await slack_service.get_is_connected(user)
    return SlackStatusOut(
        is_connected=is_connected,
    )


@router.get("/preferences", response_model=SlackPreferencesInOut)
async def slack_preferences(
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> SlackPreferencesInOut:
    user = await repo.get_user(subject)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    slack = user.integrations.slack

    return SlackPreferencesInOut(
        slack_enabled=slack.enabled if slack else False,
        slack_dnd_emoji=slack.dnd_emoji if slack else ":no_bell:",
        slack_dnd_text=slack.dnd_text if slack else "Focus time!",
    )


@router.put("/preferences", response_model=SlackPreferencesInOut)
async def update_slack_preferences(
    payload: SlackPreferencesInOut,
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
) -> SlackPreferencesInOut:
    user = await repo.get_user(subject)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    updated_user = await repo.update_slack_preferences(
        user,
        slack_enabled=payload.slack_enabled,
        slack_dnd_emoji=payload.slack_dnd_emoji,
        slack_dnd_text=payload.slack_dnd_text,
    )

    slack = updated_user.integrations.slack

    return SlackPreferencesInOut(
        slack_enabled=slack.enabled if slack else False,
        slack_dnd_emoji=slack.dnd_emoji if slack else ":no_bell:",
        slack_dnd_text=slack.dnd_text if slack else "Focus time!",
    )


@router.post("/test", response_model=SlackTestOut)
async def slack_test(
    body: SlackTestIn,
    subject: str = Depends(get_current_subject),
    repo: UserRepo = Depends(get_user_repo),
    slack_service: SlackServiceProtocol = Depends(get_slack_service),
) -> SlackTestOut:
    user = await repo.get_user(subject)
    if not await slack_service.get_is_connected(user):
        return SlackTestOut(success=False, message="Slack integration not connected")
    if not user or not user.integrations.slack or not user.integrations.slack.slack_token:
        return SlackTestOut(success=False, message="Slack integration not properly configured")

    if body.action == "start":
        if not body.dnd_text or not body.dnd_emoji:
            return SlackTestOut(
                success=False,
                message="dnd_text and dnd_emoji are required for testing focus mode",
            )
        await slack_service.start_focus(
            user_reference=subject,
            duration_minutes=5,
            user_token=user.integrations.slack.slack_token,
            dnd_text=body.dnd_text,
            dnd_emoji=body.dnd_emoji,
        )
    elif body.action == "stop":
        await slack_service.stop_focus(
            user_reference=subject,
            user_token=user.integrations.slack.slack_token,
        )
    return SlackTestOut(success=True)
