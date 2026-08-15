"""
Central configuration. All values come from environment variables / .env so
the same image can run in dev, staging, and prod.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    APP_NAME: str = "CodeLadder"
    API_V1_PREFIX: str = "/api/v1"

    # --- Firebase (replaces SQL database) ---
    # Path to the Firebase service-account JSON (e.g. serviceAccount.json).
    # Get it: Firebase console -> Project settings -> Service accounts -> Generate.
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "serviceAccount.json"
    # On Render / cloud: paste the entire service-account JSON as one env var.
    # If set, this takes precedence over the file path.
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    # Project id from Firebase console -> Project settings -> General.
    FIREBASE_PROJECT_ID: str = ""

    # --- Code runner ---
    RUNNER_TIMEOUT_SECONDS: float = 5.0
    RUNNER_MEMORY_MB: int = 128
    MAX_CODE_LENGTH: int = 20_000


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
