"""Tests for the cache service."""

from __future__ import annotations

import json

from services.cache_service import get_cached, set_cached, invalidate


async def test_cache_get_miss(mock_all_db):
    """Cache miss returns None."""
    result = await get_cached("veda:nonexistent:key")
    assert result is None


async def test_cache_get_hit(mock_all_db):
    """Cache hit returns deserialized JSON."""
    mock_all_db.redis.cache_get.return_value = json.dumps({"name": "Dharma"})
    result = await get_cached("veda:test:key")
    assert result == {"name": "Dharma"}


async def test_cache_set_serializes_json(mock_all_db):
    """set_cached should serialize value as JSON and call cache_set."""
    await set_cached("veda:test:key", {"count": 42}, ttl=300)
    mock_all_db.redis.cache_set.assert_called_once()
    call_args = mock_all_db.redis.cache_set.call_args
    stored = json.loads(call_args[0][1])
    assert stored["count"] == 42


async def test_cache_graceful_on_redis_down(mock_all_db):
    """Cache operations should never raise, even if Redis is down."""
    mock_all_db.redis.cache_get.side_effect = Exception("connection refused")
    result = await get_cached("veda:test:key")
    assert result is None

    mock_all_db.redis.cache_set.side_effect = Exception("connection refused")
    await set_cached("veda:test:key", {"data": 1})

    mock_all_db.redis.cache_delete.side_effect = Exception("connection refused")
    await invalidate("veda:test:key")


async def test_scripture_list_uses_cache(app_client, mock_all_db):
    """When cache hits, DB should NOT be queried for scripture list."""
    mock_all_db.redis.cache_get.return_value = json.dumps({
        "rows": [{"id": "scp_01HX0000000000000000000001", "slug": "bhagavad-gita",
                  "name": "Bhagavad Gita", "sanskrit_name": "भगवद्गीता",
                  "category": "gita", "language": "sanskrit", "period": None,
                  "description": "The Song of God", "is_canonical": True,
                  "metadata": {}, "chapter_count": 18, "verse_count": 700,
                  "created_at": "2026-06-14T00:00:00Z"}],
        "total": 1,
    })

    resp = await app_client.get("/api/v1/scriptures")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    # fetch should NOT have been called — data came from cache
    mock_all_db.pg.fetch.assert_not_called()


async def test_scripture_list_populates_cache(app_client, mock_all_db, make_scripture_row):
    """On cache miss, result should be stored in cache."""
    mock_all_db.pg.fetchval.return_value = 1
    mock_all_db.pg.fetch.return_value = [make_scripture_row()]

    resp = await app_client.get("/api/v1/scriptures")
    assert resp.status_code == 200
    assert mock_all_db.redis.cache_set.called
