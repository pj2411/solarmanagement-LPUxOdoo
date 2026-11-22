from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    APP_NAME: str = "SunPower Solar ERP API"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev-only-change-this-to-a-long-random-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    DATABASE_URL: str = "postgresql+psycopg://sunpower:sunpower@localhost:5433/sunpower"
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 60
    OTP_EXPIRE_SECONDS: int = 300

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    OAUTH_REDIRECT_BASE_URL: str = "http://localhost:8000"
    OAUTH_FRONTEND_CALLBACK: str = "http://localhost:5173/oauth/callback"

    ADMIN_EMAIL: str = "admin@sunpower.in"
    ADMIN_PASSWORD: str = "demo2026"

    RAZORPAY_KEY_ID: str = "rzp_test_U2zPS64W6PWk5v"
    RAZORPAY_KEY_SECRET: str = "RNT24DdAZPKPJi3WgsyktYqa"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
