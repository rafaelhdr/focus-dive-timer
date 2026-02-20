from fastapi import APIRouter, Depends

from focusdive_api.core.auth import get_current_subject
from focusdive_api.services.slack.service import SlackServiceProtocol, get_slack_service
from focusdive_api.users.repo import UserRepo, get_user_repo

from .schemas import SlackStatusOut

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
