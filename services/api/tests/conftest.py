"""
VEDA — Test Configuration & Fixtures
======================================
Provides mock DB clients and an async HTTP test client for all API tests.
All 5 database backends are mocked so tests run without infrastructure.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest


# ---------------------------------------------------------------------------
# PostgreSQL mock
# ---------------------------------------------------------------------------

@pytest.fixture
def pg_mock(monkeypatch):
    """Mock all PostgreSQL module-level functions."""
    mock_fetch = AsyncMock(return_value=[])
    mock_fetchrow = AsyncMock(return_value=None)
    mock_fetchval = AsyncMock(return_value=0)
    mock_execute = AsyncMock(return_value="INSERT 0 1")
    mock_check_health = AsyncMock(return_value={
        "status": "operational", "version": "PostgreSQL 16.1", "tables": "15",
    })

    monkeypatch.setattr("db.postgres._pool", MagicMock())
    monkeypatch.setattr("db.postgres.fetch", mock_fetch)
    monkeypatch.setattr("db.postgres.fetchrow", mock_fetchrow)
    monkeypatch.setattr("db.postgres.fetchval", mock_fetchval)
    monkeypatch.setattr("db.postgres.execute", mock_execute)
    monkeypatch.setattr("db.postgres.check_health", mock_check_health)

    return SimpleNamespace(
        fetch=mock_fetch,
        fetchrow=mock_fetchrow,
        fetchval=mock_fetchval,
        execute=mock_execute,
        check_health=mock_check_health,
    )


# ---------------------------------------------------------------------------
# Neo4j mock
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_neo4j(monkeypatch):
    """Mock Neo4j driver and query functions."""
    mock_read = AsyncMock(return_value=[])
    mock_write = AsyncMock(return_value=[])
    mock_check_health = AsyncMock(return_value={
        "status": "operational", "nodes": "42",
    })

    monkeypatch.setattr("db.neo4j_client._driver", MagicMock())
    monkeypatch.setattr("db.neo4j_client.read_query", mock_read)
    monkeypatch.setattr("db.neo4j_client.write_query", mock_write)
    monkeypatch.setattr("db.neo4j_client.check_health", mock_check_health)
    # Patch local bindings in modules that use `from db.neo4j_client import read_query`
    monkeypatch.setattr("routers.graph.read_query", mock_read)
    monkeypatch.setattr("services.search_service.read_query", mock_read)

    return SimpleNamespace(
        read_query=mock_read,
        write_query=mock_write,
        check_health=mock_check_health,
    )


# ---------------------------------------------------------------------------
# Redis mock
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_redis(monkeypatch):
    """Mock Redis client and cache functions."""
    mock_get = AsyncMock(return_value=None)
    mock_set = AsyncMock()
    mock_delete = AsyncMock()
    mock_check_health = AsyncMock(return_value={
        "status": "operational", "version": "7.2.0",
    })

    monkeypatch.setattr("db.redis_client._client", MagicMock())
    monkeypatch.setattr("db.redis_client.cache_get", mock_get)
    monkeypatch.setattr("db.redis_client.cache_set", mock_set)
    monkeypatch.setattr("db.redis_client.cache_delete", mock_delete)
    monkeypatch.setattr("db.redis_client.check_health", mock_check_health)

    return SimpleNamespace(
        cache_get=mock_get,
        cache_set=mock_set,
        cache_delete=mock_delete,
        check_health=mock_check_health,
    )


# ---------------------------------------------------------------------------
# Qdrant mock
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_qdrant(monkeypatch):
    """Mock Qdrant vector search client."""
    mock_search = AsyncMock(return_value=[])
    mock_upsert = AsyncMock()
    mock_check_health = AsyncMock(return_value={
        "status": "operational", "collections": "4", "version": "qdrant",
    })

    monkeypatch.setattr("db.qdrant_client._client", MagicMock())
    monkeypatch.setattr("db.qdrant_client.search_vectors", mock_search)
    monkeypatch.setattr("db.qdrant_client.upsert_vectors", mock_upsert)
    monkeypatch.setattr("db.qdrant_client.check_health", mock_check_health)

    return SimpleNamespace(
        search_vectors=mock_search,
        upsert_vectors=mock_upsert,
        check_health=mock_check_health,
    )


# ---------------------------------------------------------------------------
# OpenSearch mock
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_opensearch(monkeypatch):
    """Mock OpenSearch full-text search client."""
    mock_search = AsyncMock(return_value={
        "hits": {"hits": [], "total": {"value": 0}},
    })
    mock_index = AsyncMock(return_value={"result": "created"})
    mock_check_health = AsyncMock(return_value={
        "status": "operational", "cluster_status": "green",
        "indices": "4", "version": "opensearch",
    })

    monkeypatch.setattr("db.opensearch_client._client", MagicMock())
    monkeypatch.setattr("db.opensearch_client.search", mock_search)
    monkeypatch.setattr("db.opensearch_client.index_document", mock_index)
    monkeypatch.setattr("db.opensearch_client.check_health", mock_check_health)

    return SimpleNamespace(
        search=mock_search,
        index_document=mock_index,
        check_health=mock_check_health,
    )


# ---------------------------------------------------------------------------
# Composite: all DBs mocked
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_all_db(pg_mock, mock_neo4j, mock_redis, mock_qdrant, mock_opensearch, monkeypatch):
    """Compose all 5 database mocks + patch lifespan init functions."""
    monkeypatch.setattr("db.postgres.init_postgres", AsyncMock())
    monkeypatch.setattr("db.postgres.close_postgres", AsyncMock())
    monkeypatch.setattr("db.neo4j_client.init_neo4j", AsyncMock())
    monkeypatch.setattr("db.neo4j_client.close_neo4j", AsyncMock())
    monkeypatch.setattr("db.redis_client.init_redis", AsyncMock())
    monkeypatch.setattr("db.redis_client.close_redis", AsyncMock())
    monkeypatch.setattr("db.qdrant_client.init_qdrant", AsyncMock())
    monkeypatch.setattr("db.qdrant_client.close_qdrant", AsyncMock())
    monkeypatch.setattr("db.opensearch_client.init_opensearch", AsyncMock())
    monkeypatch.setattr("db.opensearch_client.close_opensearch", AsyncMock())

    return SimpleNamespace(
        pg=pg_mock,
        neo4j=mock_neo4j,
        redis=mock_redis,
        qdrant=mock_qdrant,
        opensearch=mock_opensearch,
    )


# ---------------------------------------------------------------------------
# HTTP test client
# ---------------------------------------------------------------------------

@pytest.fixture
async def app_client(mock_all_db):
    """Async HTTP client wired to the FastAPI app with all DBs mocked."""
    from main import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


# ---------------------------------------------------------------------------
# Factory fixtures — simulate asyncpg row dicts
# ---------------------------------------------------------------------------

@pytest.fixture
def make_scripture_row():
    """Factory for scripture row dicts matching PostgreSQL column shapes."""
    def _make(
        id="scp_01HX0000000000000000000001",
        slug="bhagavad-gita",
        name="Bhagavad Gita",
        sanskrit_name="भगवद्गीता",
        category="gita",
        language="sanskrit",
        period="~500 BCE",
        description="The Song of God",
        is_canonical=True,
        metadata=None,
        chapter_count=18,
        verse_count=700,
        created_at="2026-06-14T00:00:00Z",
    ):
        return {
            "id": id, "slug": slug, "name": name,
            "sanskrit_name": sanskrit_name, "category": category,
            "language": language, "period": period,
            "description": description, "is_canonical": is_canonical,
            "metadata": metadata or {}, "chapter_count": chapter_count,
            "verse_count": verse_count, "created_at": created_at,
        }
    return _make


@pytest.fixture
def make_chapter_row():
    """Factory for chapter row dicts."""
    def _make(
        id="chp_01HX0000000000000000000002",
        scripture_id="scp_01HX0000000000000000000001",
        book_id="bok_01HX0000000000000000000005",
        chapter_number=1,
        title="Arjuna Vishada Yoga",
        sanskrit_title="अर्जुनविषादयोग",
        summary="The Yoga of Arjuna's Dejection",
        metadata=None,
        verse_count=47,
        created_at="2026-06-14T00:00:00Z",
    ):
        return {
            "id": id, "scripture_id": scripture_id, "book_id": book_id,
            "chapter_number": chapter_number, "title": title,
            "sanskrit_title": sanskrit_title, "summary": summary,
            "metadata": metadata or {}, "verse_count": verse_count,
            "created_at": created_at,
        }
    return _make


@pytest.fixture
def make_verse_row():
    """Factory for verse row dicts."""
    def _make(
        id="vrs_01HX0000000000000000000003",
        scripture_id="scp_01HX0000000000000000000001",
        book_id=None,
        chapter_id="chp_01HX0000000000000000000002",
        verse_number=47,
        canonical_reference="BG.2.47",
        metadata=None,
        created_at="2026-06-14T00:00:00Z",
    ):
        return {
            "id": id, "scripture_id": scripture_id, "book_id": book_id,
            "chapter_id": chapter_id, "verse_number": verse_number,
            "canonical_reference": canonical_reference,
            "metadata": metadata or {}, "created_at": created_at,
        }
    return _make


@pytest.fixture
def make_verse_content_row():
    """Factory for verse_content row dicts."""
    def _make(
        id="vct_01HX0000000000000000000004",
        verse_id="vrs_01HX0000000000000000000003",
        language_code="san",
        content_type="sanskrit",
        content="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
        source="Bhagavad Gita",
        is_primary=True,
        version=1,
        created_at="2026-06-14T00:00:00Z",
    ):
        return {
            "id": id, "verse_id": verse_id, "language_code": language_code,
            "content_type": content_type, "content": content,
            "source": source, "is_primary": is_primary,
            "version": version, "created_at": created_at,
        }
    return _make
