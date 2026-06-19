"""
VEDA — Cache Service
======================
JSON-serializing wrapper around Redis for graceful, non-blocking caching.
Returns None on miss or error — cache failures never block the request.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from db.redis_client import cache_get, cache_set, cache_delete

logger = logging.getLogger("veda.services.cache")

TTL_SCRIPTURE_LIST = 86400   # 24 hours — canonical data rarely changes
TTL_CONCEPT_LIST = 3600      # 1 hour
TTL_SEARCH_RESULTS = 300     # 5 minutes


async def get_cached(key: str) -> Any | None:
    try:
        raw = await cache_get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as exc:
        logger.debug("Cache miss (error): %s — %s", key, exc)
        return None


async def set_cached(key: str, value: Any, ttl: int = 3600) -> None:
    try:
        await cache_set(key, json.dumps(value, default=str), ttl=ttl)
    except Exception as exc:
        logger.debug("Cache set failed: %s — %s", key, exc)


async def invalidate(key: str) -> None:
    try:
        await cache_delete(key)
    except Exception:
        pass


def scripture_list_key(category: str | None, page: int, per_page: int) -> str:
    return f"veda:scriptures:list:{category or 'all'}:{page}:{per_page}"


def concept_list_key(category: str | None, limit: int) -> str:
    return f"veda:graph:concepts:{category or 'all'}:{limit}"


def search_key(query: str, mode: str) -> str:
    normalized = " ".join(query.strip().lower().split())
    return f"veda:search:{mode}:{normalized}"
