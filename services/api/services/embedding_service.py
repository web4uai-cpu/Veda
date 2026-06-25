"""
VEDA — Embedding Service
============================
Generates vector embeddings via OpenAI text-embedding-3-large.
Supports batching for bulk operations.
"""

from __future__ import annotations

import logging
from typing import Any

from openai import AsyncOpenAI

from config import settings

logger = logging.getLogger("veda.services.embedding")

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for the given text."""
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — returning empty vector")
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
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — returning empty vectors")
        return [[] for _ in texts]

    if not texts:
        return []

    client = _get_client()
    all_embeddings: list[list[float]] = [[] for _ in texts]

    for start in range(0, len(texts), batch_size):
        batch = texts[start : start + batch_size]
        try:
            result = await client.embeddings.create(
                input=batch,
                model=settings.embedding_model,
                dimensions=settings.embedding_dimensions,
            )
            for item in result.data:
                all_embeddings[start + item.index] = item.embedding
        except Exception as e:
            logger.error("Embedding batch %d-%d failed: %s", start, start + len(batch), e)
            if "insufficient_quota" in str(e):
                logger.warning("OpenAI quota exhausted — skipping remaining embeddings")
                break

    logger.info("Generated %d embeddings (%d dimensions)", len(texts), settings.embedding_dimensions)
    return all_embeddings
