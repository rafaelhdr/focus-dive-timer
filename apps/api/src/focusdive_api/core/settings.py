from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FOCUSDIVE_", env_file=".env")

    jwt_secret: SecretStr
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 2

    mongo_uri: str
    mongo_db: str


settings = Settings()  # type: ignore[call-arg]
