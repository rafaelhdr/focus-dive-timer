from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FOCUSDIVE_", env_file=".env")

    jwt_secret: SecretStr
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 2

    mongo_uri: str
    mongo_db: str

    smtp_user: str | None = None
    smtp_pass: SecretStr | None = None
    smtp_from: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_tls: bool = False
    smtp_ssl: bool = False


settings = Settings()  # type: ignore[call-arg]
