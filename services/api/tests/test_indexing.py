"""Tests for Phase 5: embedding and indexing services."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ============================================================================
# Embedding service tests
# ============================================================================


async def test_generate_embedding_no_api_key(monkeypatch):
    from services.embedding_service import generate_embedding

    monkeypatch.setattr("services.embedding_service.settings.openai_api_key", "")
    result = await generate_embedding("test text")
    assert result == []


async def test_generate_embeddings_no_api_key(monkeypatch):
    from services.embedding_service import generate_embeddings

    monkeypatch.setattr("services.embedding_service.settings.openai_api_key", "")
    result = await generate_embeddings(["a", "b", "c"])
    assert result == [[], [], []]


async def test_generate_embeddings_empty_list(monkeypatch):
    from services.embedding_service import generate_embeddings

    monkeypatch.setattr("services.embedding_service.settings.openai_api_key", "test-key")
    result = await generate_embeddings([])
    assert result == []


async def test_generate_embedding_calls_openai(monkeypatch):
    from services.embedding_service import generate_embedding

    mock_data = MagicMock()
    mock_data.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]

    mock_client = AsyncMock()
    mock_client.embeddings.create = AsyncMock(return_value=mock_data)

    monkeypatch.setattr("services.embedding_service.settings.openai_api_key", "test-key")
    monkeypatch.setattr("services.embedding_service._client", mock_client)

    result = await generate_embedding("dharma and duty")
    assert result == [0.1, 0.2, 0.3]
    mock_client.embeddings.create.assert_called_once()


async def test_generate_embeddings_batched(monkeypatch):
    from services.embedding_service import generate_embeddings

    call_count = 0

    async def mock_create(**kwargs):
        nonlocal call_count
        call_count += 1
        batch = kwargs["input"]
        result = MagicMock()
        result.data = [
            MagicMock(index=i, embedding=[float(call_count)] * 3)
            for i in range(len(batch))
        ]
        return result

    mock_client = AsyncMock()
    mock_client.embeddings.create = mock_create

    monkeypatch.setattr("services.embedding_service.settings.openai_api_key", "test-key")
    monkeypatch.setattr("services.embedding_service._client", mock_client)

    texts = [f"text_{i}" for i in range(5)]
    result = await generate_embeddings(texts, batch_size=2)

    assert len(result) == 5
    assert call_count == 3  # 2 + 2 + 1


# ============================================================================
# Indexing service tests
# ============================================================================


async def test_index_scripture_verses_empty(monkeypatch):
    from services.indexing_service import index_scripture_verses

    monkeypatch.setattr("services.indexing_service.postgres.fetch", AsyncMock(return_value=[]))

    result = await index_scripture_verses()
    assert result["verses_found"] == 0
    assert result["qdrant_upserted"] == 0


async def test_index_scripture_verses_with_data(monkeypatch):
    from services.indexing_service import index_scripture_verses

    mock_rows = [
        {"verse_id": "vrs_01", "canonical_reference": "BG.2.47",
         "scripture_id": "scp_01", "verse_number": 47,
         "scripture_name": "Bhagavad Gita", "scripture_slug": "bhagavad-gita",
         "chapter_number": 2,
         "sanskrit": "कर्मण्येवाधिकारस्ते",
         "translation": "You have the right to perform your duty"},
    ]
    monkeypatch.setattr("services.indexing_service.postgres.fetch", AsyncMock(return_value=mock_rows))
    monkeypatch.setattr("services.indexing_service.generate_embeddings", AsyncMock(return_value=[[0.1] * 3072]))
    monkeypatch.setattr("services.indexing_service.upsert_vectors", AsyncMock())
    monkeypatch.setattr("services.indexing_service.index_document", AsyncMock())

    result = await index_scripture_verses()
    assert result["verses_found"] == 1
    assert result["qdrant_upserted"] == 1
    assert result["opensearch_indexed"] == 1


async def test_index_upload_chunks_empty(monkeypatch):
    from services.indexing_service import index_upload_chunks

    monkeypatch.setattr("services.indexing_service.postgres.fetch", AsyncMock(return_value=[]))

    result = await index_upload_chunks("upl_nonexistent")
    assert result["chunks_found"] == 0


async def test_index_upload_chunks_with_data(monkeypatch):
    from services.indexing_service import index_upload_chunks

    mock_rows = [
        {"chunk_id": "chk_01", "upload_id": "upl_01", "chunk_index": 0,
         "content": "Dharma is the foundation of life.",
         "page_start": 1, "page_end": 1,
         "title": "Test Document", "filename": "test.pdf",
         "scripture_id": None, "language": "en"},
    ]
    monkeypatch.setattr("services.indexing_service.postgres.fetch", AsyncMock(return_value=mock_rows))
    monkeypatch.setattr("services.indexing_service.generate_embeddings", AsyncMock(return_value=[[0.2] * 3072]))
    monkeypatch.setattr("services.indexing_service.upsert_vectors", AsyncMock())
    monkeypatch.setattr("services.indexing_service.index_document", AsyncMock())

    result = await index_upload_chunks("upl_01")
    assert result["chunks_found"] == 1
    assert result["qdrant_upserted"] == 1
    assert result["opensearch_indexed"] == 1


async def test_index_all_orchestrates(monkeypatch):
    from services.indexing_service import index_all

    monkeypatch.setattr(
        "services.indexing_service.index_scripture_verses",
        AsyncMock(return_value={"verses_found": 700, "qdrant_upserted": 700, "opensearch_indexed": 700}),
    )
    monkeypatch.setattr(
        "services.indexing_service.index_all_uploads",
        AsyncMock(return_value={"uploads_processed": 2, "qdrant_upserted": 15, "opensearch_indexed": 15}),
    )

    result = await index_all()
    assert result["scriptures"]["verses_found"] == 700
    assert result["uploads"]["uploads_processed"] == 2


# ============================================================================
# Indexing router tests (admin auth)
# ============================================================================


async def test_indexing_requires_admin(app_client, mock_all_db, monkeypatch):
    monkeypatch.setattr("config.settings.admin_api_key", "test-secret")
    resp = await app_client.post("/api/v1/admin/indexing/corpus")
    assert resp.status_code == 403
