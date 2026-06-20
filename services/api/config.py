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
    app_version: str = "0.2.0"
    debug: bool = False

    # --- Database (Supabase / PostgreSQL) ---
    database_url: str = "postgresql://veda:vedadev2026@localhost:5432/veda"

    # --- Supabase ---
    supabase_url: str = "http://localhost:54321"
    supabase_service_key: str = ""

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


settings = Settings()
