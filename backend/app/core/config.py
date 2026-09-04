from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "conmeet.moe"
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+asyncpg://conmeet:conmeet@localhost:5433/conmeet"

    auth_cookie_name: str = "conmeet_session"
    auth_cookie_domain: str | None = None
    auth_cookie_secure: bool = False
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 30
    jwt_secret_key: SecretStr = Field(default=SecretStr("dev-secret-change-me"))
    jwt_algorithm: str = "HS256"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    discord_client_id: str | None = None
    discord_client_secret: SecretStr | None = None
    discord_redirect_uri: str | None = None

    google_client_id: str | None = None
    google_client_secret: SecretStr | None = None
    google_redirect_uri: str | None = None

    r2_account_id: str | None = None
    r2_access_key_id: str | None = None
    r2_secret_access_key: SecretStr | None = None
    r2_bucket_public: str = "conmeet-media"
    r2_bucket_private: str = "conmeet-uploads"
    r2_public_url: str | None = None
    r2_endpoint_url: str | None = None

    @property
    def frontend_url(self) -> str:
        return "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
