import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol

from .mongoengine import User as MongoUser

DEFAULT_PREFERENCES = {
    "focus_beep_enabled": True,
    "focus_beep_volume": 100,
    "alarm_sound": "minimalistic",
    "autostart_break": True,
    "autostart_focus": True,
    "default_focus_duration": 25,
    "default_break_duration": 5,
}

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SlackIntegration:
    slack_token: str


@dataclass(frozen=True)
class Integrations:
    slack: SlackIntegration | None = None


@dataclass(frozen=True)
class User:
    id: str
    email: str
    is_beta_user: bool
    preferences: dict
    timer: dict
    integrations: Integrations = Integrations()


class UserRepo(Protocol):
    async def get_user(self, subject: str) -> User | None: ...

    async def upsert_by_email(self, email: str) -> User: ...

    async def update_preferences(self, user: User, new_prefs: dict) -> User: ...

    async def update_timer(self, user: User, new_timer: dict) -> User: ...


class MongoUserRepo:
    async def get_user(self, user_email: str) -> User | None:
        try:
            doc = MongoUser.objects.get(email=user_email)
            logger.info(f"Found user in DB: {doc.email} (beta: {getattr(doc, 'is_beta_user', False)})")
        except MongoUser.DoesNotExist:
            return None

        slack = None
        if doc.slack_token:
            slack = SlackIntegration(slack_token=doc.slack_token)
        return User(
            id=str(doc.id),
            email=doc.email,
            integrations=Integrations(
                slack=slack,
            ),
            is_beta_user=bool(getattr(doc, "is_beta_user", False)),
            preferences=getattr(doc, "preferences", {}) or {},
            timer=getattr(doc, "timer", {}) or {},
        )

    async def upsert_by_email(self, email: str) -> User:
        now = datetime.now(timezone.utc)
        doc = MongoUser.objects(email=email).modify(
            new=True,
            upsert=True,
            set_on_insert__email=email,
            set_on_insert__is_beta_user=False,
            set_on_insert__created=now,
            set_on_insert__preferences=DEFAULT_PREFERENCES,
            set__updated=now,
        )

        return User(
            id=str(doc.id),
            email=doc.email,
            is_beta_user=bool(getattr(doc, "is_beta_user", False)),
            preferences=getattr(doc, "preferences", {}) or {},
            timer=getattr(doc, "timer", {}) or {},
        )

    async def update_preferences(self, user: User, new_prefs: dict) -> User:
        MongoUser.objects(id=user.id).update(set__preferences=new_prefs)
        return MongoUser.objects.get(id=user.id)

    async def update_timer(self, user: User, new_timer: dict) -> User:
        MongoUser.objects(id=user.id).update(set__timer=new_timer)
        return await self.get_user(user.email)


def get_user_repo() -> MongoUserRepo:
    return MongoUserRepo()
