"""
VEDA API Configuration
========================
Environment-based configuration for the FastAPI service.
All values loaded from environment variables with sensible defaults.
"""

import os
from dataclasses import dataclass, field


def _csv_env(name: str, default: list[str]) -> list[str]:
    """Read a comma-separated env var while ignoring empty values."""
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass
class Settings:
    """Application settings loaded from environment."""

    # --- App ---
    app_name: str = "VEDA API"
    app_version: str = "0.1.0"
    debug: bool = field(default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true")

    # --- Database (Supabase / PostgreSQL) ---
    database_url: str = field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", "postgresql://veda:vedadev2026@localhost:5432/veda"
        )
    )

    # --- Supabase ---
    supabase_url: str = field(
        default_factory=lambda: os.getenv("SUPABASE_URL", "http://localhost:54321")
    )
    supabase_service_key: str = field(
        default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    )

    # --- Neo4j ---
    neo4j_uri: str = field(
        default_factory=lambda: os.getenv("NEO4J_URI", "bolt://localhost:7687")
    )
    neo4j_user: str = field(default_factory=lambda: os.getenv("NEO4J_USER", "neo4j"))
    neo4j_password: str = field(
        default_factory=lambda: os.getenv("NEO4J_PASSWORD", "vedadev2026")
    )

    # --- Qdrant ---
    qdrant_url: str = field(
        default_factory=lambda: os.getenv("QDRANT_URL", "http://localhost:6333")
    )

    # --- OpenSearch ---
    opensearch_url: str = field(
        default_factory=lambda: os.getenv("OPENSEARCH_URL", "http://localhost:9200")
    )

    # --- Redis ---
    redis_url: str = field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379")
    )

    # --- LLM (OpenRouter) ---
    openrouter_api_key: str = field(
        default_factory=lambda: os.getenv("OPENROUTER_API_KEY", "")
    )
    openrouter_base_url: str = field(
        default_factory=lambda: os.getenv(
            "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
        )
    )
    llm_primary_model: str = field(
        default_factory=lambda: os.getenv("LLM_PRIMARY_MODEL", "openai/gpt-5.5")
    )
    llm_fallback_model: str = field(
        default_factory=lambda: os.getenv(
            "LLM_FALLBACK_MODEL", "anthropic/claude-sonnet-4"
        )
    )

    # --- Embeddings ---
    openai_api_key: str = field(
        default_factory=lambda: os.getenv("OPENAI_API_KEY", "")
    )
    embedding_model: str = field(
        default_factory=lambda: os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
    )
    embedding_dimensions: int = field(
        default_factory=lambda: int(os.getenv("EMBEDDING_DIMENSIONS", "3072"))
    )

    # --- CORS ---
    cors_origins: list[str] = field(
        default_factory=lambda: _csv_env(
            "CORS_ORIGINS",
            [
                "http://localhost:3000",
                "http://localhost:3001",
            ],
        )
    )


settings = Settings()
