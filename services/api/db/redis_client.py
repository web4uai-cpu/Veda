"""
VEDA — Redis Cache Connection
================================
Async Redis client for caching, sessions, and rate limiting.
"""

from __future__ import annotations

import logging

import redis.asyncio as redis

from config import settings

logger = logging.getLogger("veda.db.redis")

_client: redis.Redis | None = None


async def init_redis() -> redis.Redis:
    """Initialize the Redis async client."""
    global _client
    if _client is not None:
        return _client

    logger.info("Connecting to Redis at %s", settings.redis_url)
    _client = redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,
    )
    # Verify connectivity
    await _client.ping()
    logger.info("Redis connected")
    return _client


async def close_redis():
    """Close the Redis client."""
    global _client
    if _client:
        await _client.aclose()
        _client = None
        logger.info("Redis closed")


def get_client() -> redis.Redis:
    """Get the current Redis client."""
    if _client is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return _client


async def cache_get(key: str) -> str | None:
    """Get a value from cache."""
    client = get_client()
    return await client.get(key)


async def cache_set(key: str, value: str, ttl: int = 3600) -> None:
    """Set a value in cache with TTL (default 1 hour)."""
    client = get_client()
    await client.set(key, value, ex=ttl)


async def cache_delete(key: str) -> None:
    """Delete a key from cache."""
    client = get_client()
    await client.delete(key)


async def check_health() -> dict[str, str]:
    """Check Redis connectivity."""
    try:
        client = get_client()
        info = await client.info("server")
        return {
            "status": "operational",
            "version": info.get("redis_version", "unknown"),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
