from fastapi import APIRouter, Depends

from focusdive_api.core.auth import get_current_subject
from focusdive_api.services.slack.service import SlackServiceProtocol, get_slack_service
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import SlackStatusOut, SlackTestIn, SlackTestOut

router = APIRouter(prefix="/slack", tags=["integrations:slack"])


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
            return SlackTestOut(success=False, message="dnd_text and dnd_emoji are required for testing focus mode")
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
