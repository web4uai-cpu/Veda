"""
VEDA — Qdrant Vector Store Connection
=========================================
Async client for Qdrant vector database.
Used for semantic search over scripture embeddings.

Collections (per infrastructure/qdrant/init_collections.py):
    - scripture_chunks   (3072-dim, cosine)
    - commentary_chunks  (3072-dim, cosine)
    - upload_chunks      (3072-dim, cosine)
    - research_chunks    (3072-dim, cosine)
"""

from __future__ import annotations

import logging
from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct, Filter, SearchRequest

from config import settings

logger = logging.getLogger("veda.db.qdrant")

_client: AsyncQdrantClient | None = None


async def init_qdrant() -> AsyncQdrantClient:
    """Initialize the Qdrant async client."""
    global _client
    if _client is not None:
        return _client

    logger.info("Connecting to Qdrant at %s", settings.qdrant_url)
    _client = AsyncQdrantClient(url=settings.qdrant_url, timeout=5)

    # Verify connectivity by listing collections
    collections = await _client.get_collections()
    logger.info(
        "Qdrant connected (%d collections)",
        len(collections.collections),
    )
    return _client


async def close_qdrant():
    """Close the Qdrant client."""
    global _client
    if _client:
        await _client.close()
        _client = None
        logger.info("Qdrant client closed")


def get_client() -> AsyncQdrantClient:
    """Get the current Qdrant client. Raises if not initialized."""
    if _client is None:
        raise RuntimeError("Qdrant client not initialized. Call init_qdrant() first.")
    return _client


async def search_vectors(
    collection_name: str,
    query_vector: list[float],
    limit: int = 10,
    score_threshold: float | None = None,
    filter_conditions: Filter | None = None,
) -> list[dict[str, Any]]:
    """
    Search for similar vectors in a collection.

    Args:
        collection_name: Name of the Qdrant collection
        query_vector: The query embedding vector
        limit: Maximum number of results
        score_threshold: Minimum similarity score
        filter_conditions: Optional Qdrant filter

    Returns:
        List of dicts with id, score, and payload
    """
    client = get_client()
    results = await client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=limit,
        score_threshold=score_threshold,
        query_filter=filter_conditions,
    )
    return [
        {
            "id": str(hit.id),
            "score": hit.score,
            "payload": hit.payload or {},
        }
        for hit in results
    ]


async def upsert_vectors(
    collection_name: str,
    points: list[dict[str, Any]],
) -> None:
    """
    Upsert vectors into a collection.

    Args:
        collection_name: Target collection
        points: List of dicts with 'id', 'vector', and 'payload' keys
    """
    client = get_client()
    await client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(
                id=p["id"],
                vector=p["vector"],
                payload=p.get("payload", {}),
            )
            for p in points
        ],
    )


async def check_health() -> dict[str, str]:
    """Check Qdrant connectivity. Returns status dict."""
    try:
        client = get_client()
        collections = await client.get_collections()
        collection_names = [c.name for c in collections.collections]
        return {
            "status": "operational",
            "collections": str(len(collection_names)),
            "version": "qdrant",
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
