import re
from functools import lru_cache
from typing import Optional
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or .env file."""

    app_name: str = "AI Digital Twin Simulator"
    app_version: str = "0.1.0"
    app_stage: str = "Step 12: Supabase PostgreSQL Database Integration"
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    frontend_origin: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cors_allow_origin_regex: Optional[str] = r"^https://.*\.vercel\.app$"

    # Database Configuration (Supabase PostgreSQL Session Pooler)
    database_url: Optional[str] = None
    db_host: str = "aws-0-ap-northeast-2.pooler.supabase.com"
    db_port: int = 5432
    db_name: str = "postgres"
    db_user: str = "postgres.gqilhgcbqkbttbqqgoqb"
    db_password: Optional[str] = None
    db_sslmode: str = "require"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_timeout: int = 10
    db_echo: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_database_url(self) -> Optional[str]:
        """Construct or normalize the PostgreSQL database URL.
        
        Handles:
        1. Explicit DATABASE_URL (converts postgres:// to postgresql:// if needed).
        2. Discrete connection parameters (URL-encodes username and password safely).
        3. Returns None if no database connection credentials are provided.
        """
        if self.database_url and self.database_url.strip():
            url = self.database_url.strip()
            # SQLAlchemy requires postgresql:// instead of legacy postgres://
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://"):]
            return url

        if self.db_password and self.db_password.strip():
            safe_user = quote_plus(self.db_user.strip())
            safe_pass = quote_plus(self.db_password.strip())
            return (
                f"postgresql://{safe_user}:{safe_pass}@"
                f"{self.db_host.strip()}:{self.db_port}/{self.db_name.strip()}?sslmode={self.db_sslmode.strip()}"
            )

        return None

    def get_masked_database_url(self) -> str:
        """Return database URL with password masked for safe logging and status reporting."""
        raw_url = self.get_database_url()
        if not raw_url:
            return "Not Configured"
        # Mask password using regex
        return re.sub(r":([^:@]+)@", r":****@", raw_url)

    def get_cors_origins(self) -> list[str]:
        """Return list of allowed CORS origins combining frontend_origin and cors_origins."""
        origins: set[str] = set()
        for field in (self.frontend_origin, self.cors_origins):
            if field and field.strip():
                for item in field.split(","):
                    cleaned = item.strip().rstrip("/")
                    if cleaned:
                        origins.add(cleaned)
        return sorted(list(origins))


@lru_cache
def get_settings() -> Settings:
    """Return a cached instance of the application settings."""
    return Settings()
