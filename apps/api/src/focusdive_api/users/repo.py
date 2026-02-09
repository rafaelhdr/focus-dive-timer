from dataclasses import dataclass
from typing import Protocol

from .mongoengine import User as MongoUser


@dataclass(frozen=True)
class User:
    id: str
    email: str
    is_beta_user: bool


class UserRepo(Protocol):
    async def get_user(self, subject: str) -> User | None:
        """
        subject = value from JWT 'sub'
        """
        ...


class MongoUserRepo:
    async def get_user(self, user_email: str) -> User | None:
        try:
            doc = MongoUser.objects.get(email=user_email)
        except MongoUser.DoesNotExist:
            return None

        return User(
            id=str(doc.id),
            email=doc.email,
            is_beta_user=bool(getattr(doc, "is_beta_user", False)),
        )


def get_user_repo() -> MongoUserRepo:
    return MongoUserRepo()
