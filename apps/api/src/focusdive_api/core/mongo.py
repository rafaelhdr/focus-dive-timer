from mongoengine import connect, disconnect
from focusdive_api.core.settings import settings


def connect_mongo() -> None:
    connect(
        db=settings.mongo_db,
        host=settings.mongo_uri,
        alias="default",
    )


def disconnect_mongo() -> None:
    disconnect(alias="default")
