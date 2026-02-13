from functools import lru_cache

from fastapi_mail import FastMail

from .config import build_mail_config
from .fastapi_mailer import FastApiMailer
from .interface import Mailer


@lru_cache
def _get_fastmail() -> FastMail:
    return FastMail(build_mail_config())


def get_mailer() -> Mailer:
    return FastApiMailer(_get_fastmail())
