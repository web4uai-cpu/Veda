"""
VEDA API Configuration
========================
Environment-based configuration for the FastAPI service.
Uses Pydantic Settings for validation and .env file support.
"""

from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    app_name: str = "VEDA API"
    app_version: str = "0.3.0"
    debug: bool = False
    environment: str = "development"  # development | production
    # Trust X-Forwarded-For for client identity (enable only behind a proxy
    # that sets it, e.g. Railway/Vercel edge).
    trust_proxy_headers: bool = False

    # --- Database (PostgreSQL via Railway) ---
    database_url: str = "postgresql://veda:vedadev2026@localhost:5432/veda"

    # --- Firebase ---
    firebase_service_account_json: str = ""
    firebase_service_account_path: str = ""
    firebase_storage_bucket: str = "veda-9a7d6.firebasestorage.app"

    # --- Neo4j ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "vedadev2026"

    # --- Qdrant ---
    qdrant_url: str = "http://localhost:6333"

    # --- OpenSearch ---
    opensearch_url: str = "http://localhost:9200"

    # --- Redis ---
    redis_url: str = "redis://localhost:6379"

    # --- LLM (OpenRouter) ---
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    llm_primary_model: str = "openai/gpt-5.5"
    llm_fallback_model: str = "anthropic/claude-sonnet-4"

    # --- Embeddings ---
    openai_api_key: str = ""
    embedding_model: str = "text-embedding-3-large"
    embedding_dimensions: int = 3072
    # Optional OpenAI-compatible embedding provider override
    # (e.g. https://generativelanguage.googleapis.com/v1beta/openai/ with
    # model gemini-embedding-001). Falls back to openai_api_key/OpenAI.
    embedding_base_url: str = ""
    embedding_api_key: str = ""

    # --- Admin ---
    admin_api_key: str = ""

    # --- CORS ---
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith("postgresql://") and not v.startswith("postgres://"):
            raise ValueError("database_url must start with postgresql:// or postgres://")
        return v

    @field_validator("embedding_dimensions")
    @classmethod
    def validate_embedding_dimensions(cls, v: int) -> int:
        if v not in (768, 1536, 3072):
            raise ValueError(f"embedding_dimensions must be 768, 1536, or 3072 — got {v}")
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in ("production", "prod")

    def validate_production(self) -> list[str]:
        """Return a list of fatal misconfigurations when running in production."""
        problems: list[str] = []
        if not self.is_production:
            return problems
        if "vedadev2026" in self.database_url:
            problems.append("database_url uses the default dev password")
        if self.neo4j_password == "vedadev2026":
            problems.append("neo4j_password uses the default dev password")
        if not self.admin_api_key:
            problems.append("admin_api_key is not set")
        if self.debug:
            problems.append("debug must be false in production")
        return problems


settings = Settings()

