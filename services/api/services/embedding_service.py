"""
VEDA — Embedding Service
============================
Generates vector embeddings through any OpenAI-compatible embeddings API.

Default: OpenAI text-embedding-3-large. Set EMBEDDING_BASE_URL and
EMBEDDING_API_KEY to use another provider (e.g. Gemini's OpenAI-compat
endpoint with model gemini-embedding-001 — also 3072 dims).
Supports batching for bulk operations.
"""

from __future__ import annotations

import logging
from typing import Any

from openai import AsyncOpenAI

from config import settings

logger = logging.getLogger("veda.services.embedding")

_client: AsyncOpenAI | None = None


def _api_key() -> str:
    return settings.embedding_api_key or settings.openai_api_key


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=_api_key(),
            base_url=settings.embedding_base_url or None,
        )
    return _client


async def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for the given text."""
    if not _api_key():
        logger.warning("No embedding API key set — returning empty vector")
        return []

    result = await _get_client().embeddings.create(
        input=[text],
        model=settings.embedding_model,
        dimensions=settings.embedding_dimensions,
    )
    return result.data[0].embedding


async def generate_embeddings(
    texts: list[str],
    batch_size: int = 100,
) -> list[list[float]]:
    """Generate embeddings for multiple texts, batched to respect API limits.

    Args:
        texts: List of strings to embed.
        batch_size: Max texts per API call (OpenAI limit: 2048, but 100 is safer for rate limits).

    Returns:
        List of embedding vectors in the same order as input texts.
    """
    if not _api_key():
        logger.warning("No embedding API key set — returning empty vectors")
        return [[] for _ in texts]

    if not texts:
        return []

    import asyncio

    client = _get_client()
    all_embeddings: list[list[float]] = [[] for _ in texts]

    for start in range(0, len(texts), batch_size):
        batch = texts[start : start + batch_size]
        # Free-tier providers (e.g. Gemini: 100 requests/min, one per input
        # text) rate-limit aggressively — wait out the window and retry
        # instead of dropping the batch.
        for attempt in range(4):
            try:
                result = await client.embeddings.create(
                    input=batch,
                    model=settings.embedding_model,
                    dimensions=settings.embedding_dimensions,
                )
                for item in result.data:
                    all_embeddings[start + item.index] = item.embedding
                break
            except Exception as e:
                msg = str(e)
                if "insufficient_quota" in msg:
                    logger.warning("Embedding quota exhausted (billing) — skipping remaining embeddings")
                    return all_embeddings
                if ("429" in msg or "RESOURCE_EXHAUSTED" in msg) and attempt < 3:
                    logger.info(
                        "Embedding batch %d-%d rate-limited — waiting 65s (attempt %d/3)",
                        start, start + len(batch), attempt + 1,
                    )
                    await asyncio.sleep(65)
                    continue
                logger.error("Embedding batch %d-%d failed: %s", start, start + len(batch), e)
                break

    logger.info("Generated %d embeddings (%d dimensions)", len(texts), settings.embedding_dimensions)
    return all_embeddings
