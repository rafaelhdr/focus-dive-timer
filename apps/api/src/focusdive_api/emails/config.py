from pathlib import Path

from fastapi_mail import ConnectionConfig

from focusdive_api.core.settings import settings

TEMPLATES_DIR = Path(__file__).parent / "templates"


def build_mail_config() -> ConnectionConfig:
    if not settings.smtp_host or not settings.smtp_pass:
        raise ValueError("SMTP host and password must be set to send emails")

    return ConnectionConfig(
        MAIL_USERNAME=settings.smtp_user or "",
        MAIL_PASSWORD=settings.smtp_pass,
        MAIL_FROM=settings.smtp_from or "",
        MAIL_SERVER=settings.smtp_host,
        MAIL_PORT=settings.smtp_port or 1025,
        MAIL_STARTTLS=settings.smtp_tls,
        MAIL_SSL_TLS=settings.smtp_ssl,
        USE_CREDENTIALS=bool(settings.smtp_user and settings.smtp_pass),
        TEMPLATE_FOLDER=TEMPLATES_DIR,
    )
