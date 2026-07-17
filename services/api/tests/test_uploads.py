"""Tests for admin upload API and PDF processing."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch, MagicMock

import pytest


# ============================================================================
# Auth tests
# ============================================================================


async def test_list_uploads_no_key_rejected(app_client, mock_all_db, monkeypatch):
    monkeypatch.setattr("config.settings.admin_api_key", "test-secret")
    resp = await app_client.get("/api/v1/admin/uploads")
    assert resp.status_code == 401


async def test_list_uploads_wrong_key_rejected(app_client, mock_all_db, monkeypatch):
    monkeypatch.setattr("config.settings.admin_api_key", "test-secret")
    resp = await app_client.get(
        "/api/v1/admin/uploads",
        headers={"X-Admin-Key": "wrong-key"},
    )
    assert resp.status_code == 401


async def test_list_uploads_empty_server_key_rejected(app_client, mock_all_db, monkeypatch):
    monkeypatch.setattr("config.settings.admin_api_key", "")
    resp = await app_client.get(
        "/api/v1/admin/uploads",
        headers={"X-Admin-Key": "anything"},
    )
    assert resp.status_code == 401


async def test_get_upload_requires_admin(app_client, mock_all_db, monkeypatch):
    monkeypatch.setattr("config.settings.admin_api_key", "test-secret")
    resp = await app_client.get("/api/v1/admin/uploads/upl_01")
    assert resp.status_code == 401


# ============================================================================
# PDF processing unit tests
# ============================================================================


def test_chunk_text_basic():
    from services.pdf_service import chunk_text

    pages = [
        {"page": 1, "text": "First paragraph.\n\nSecond paragraph."},
        {"page": 2, "text": "Third paragraph on page two."},
    ]
    chunks = chunk_text(pages, max_tokens=50, overlap_tokens=0)
    assert len(chunks) >= 1
    assert chunks[0]["page_start"] == 1
    assert chunks[0]["chunk_index"] == 0
    assert "First paragraph" in chunks[0]["content"]


def test_chunk_text_empty():
    from services.pdf_service import chunk_text

    chunks = chunk_text([], max_tokens=800, overlap_tokens=100)
    assert chunks == []


def test_chunk_text_empty_pages():
    from services.pdf_service import chunk_text

    pages = [{"page": 1, "text": ""}, {"page": 2, "text": ""}]
    chunks = chunk_text(pages)
    assert chunks == []


def test_chunk_text_preserves_page_range():
    from services.pdf_service import chunk_text

    pages = [
        {"page": 1, "text": "Content on page one."},
        {"page": 2, "text": "Content on page two."},
        {"page": 3, "text": "Content on page three."},
    ]
    chunks = chunk_text(pages, max_tokens=5000, overlap_tokens=0)
    assert len(chunks) == 1
    assert chunks[0]["page_start"] == 1
    assert chunks[0]["page_end"] == 3


# ============================================================================
# Upload service tests (mocked DB + storage)
# ============================================================================


async def test_list_uploads_returns_list(monkeypatch):
    from services.upload_service import list_uploads

    mock_fetch = AsyncMock(return_value=[
        {"id": "upl_01", "filename": "test.pdf", "status": "completed",
         "chunk_count": 5, "user_id": "usr_admin", "file_type": "pdf",
         "storage_key": "admin/test.pdf", "title": "Test", "scripture_id": None,
         "language": "en", "size_bytes": 1000, "error_message": None,
         "metadata": {}, "uploaded_at": "2026-06-19T00:00:00Z"},
    ])
    mock_fetchval = AsyncMock(return_value=1)

    monkeypatch.setattr("services.upload_service.fetch", mock_fetch)
    monkeypatch.setattr("services.upload_service.fetchval", mock_fetchval)

    uploads, total = await list_uploads()
    assert total == 1
    assert len(uploads) == 1
    assert uploads[0]["id"] == "upl_01"


async def test_get_upload_not_found(monkeypatch):
    from services.upload_service import get_upload

    monkeypatch.setattr("services.upload_service.fetchrow", AsyncMock(return_value=None))

    with pytest.raises(ValueError, match="not found"):
        await get_upload("upl_nonexistent")


# ============================================================================
# Scripture registry tests
# ============================================================================


def test_registry_has_all_scriptures():
    from services.seed_scripture_registry import ALL_SCRIPTURES, VEDAS, PURANAS, UPANISHADS, SHASTRAS

    assert len(VEDAS) == 4
    assert len(PURANAS) == 18
    assert len(UPANISHADS) == 13
    assert len(SHASTRAS) == 14
    assert len(ALL_SCRIPTURES) == 49


def test_registry_slugs_unique():
    from services.seed_scripture_registry import ALL_SCRIPTURES

    slugs = [s["slug"] for s in ALL_SCRIPTURES]
    assert len(slugs) == len(set(slugs)), f"Duplicate slugs: {[s for s in slugs if slugs.count(s) > 1]}"


def test_registry_categories_valid():
    from services.seed_scripture_registry import ALL_SCRIPTURES

    valid = {"veda", "upanishad", "gita", "purana", "ramayana", "mahabharata", "commentary", "shastra"}
    for s in ALL_SCRIPTURES:
        assert s["category"] in valid, f"{s['slug']} has invalid category: {s['category']}"


def test_registry_all_have_sanskrit_names():
    from services.seed_scripture_registry import ALL_SCRIPTURES

    for s in ALL_SCRIPTURES:
        assert s["sanskrit_name"], f"{s['slug']} missing sanskrit_name"


def test_registry_all_have_metadata():
    from services.seed_scripture_registry import ALL_SCRIPTURES

    for s in ALL_SCRIPTURES:
        assert isinstance(s["metadata"], dict), f"{s['slug']} metadata is not a dict"
        assert len(s["metadata"]) >= 1, f"{s['slug']} has empty metadata"


async def test_seed_scripture_skips_existing(monkeypatch):
    from services.seed_scripture_registry import seed_scripture

    monkeypatch.setattr(
        "services.seed_scripture_registry.fetchval",
        AsyncMock(return_value="scp_existing"),
    )

    result = await seed_scripture({"slug": "rigveda", "name": "Rigveda", "sanskrit_name": "ऋग्वेद",
                                    "category": "veda", "period": "~1500 BCE",
                                    "description": "Test", "metadata": {}})
    assert result is None


async def test_seed_scripture_creates_new(monkeypatch):
    from services.seed_scripture_registry import seed_scripture

    monkeypatch.setattr("services.seed_scripture_registry.fetchval", AsyncMock(return_value=None))
    monkeypatch.setattr("services.seed_scripture_registry.execute", AsyncMock())

    result = await seed_scripture({"slug": "rigveda", "name": "Rigveda", "sanskrit_name": "ऋग्वेद",
                                    "category": "veda", "period": "~1500 BCE",
                                    "description": "Test", "metadata": {"total_mantras": 10552}})
    assert result is not None
    assert result.startswith("scp_")
