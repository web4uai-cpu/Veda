"""Tests for the corpus status router and service."""

from __future__ import annotations


async def test_corpus_status_empty(app_client, mock_all_db):
    mock_all_db.pg.fetch.return_value = []

    resp = await app_client.get("/api/v1/corpus/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "empty"
    assert data["scriptures"] == []


async def test_corpus_status_partial(app_client, mock_all_db):
    mock_all_db.pg.fetch.return_value = [
        {
            "scripture_id": "scp_01TEST",
            "slug": "bhagavad-gita",
            "name": "Bhagavad Gita",
            "chapter_count": 18,
            "verse_count": 700,
            "content_count": 1400,
            "sanskrit_count": 700,
            "transliteration_count": 0,
            "translation_count": 500,
        }
    ]

    resp = await app_client.get("/api/v1/corpus/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "partial"
    assert len(data["blockers"]) > 0
    assert data["scriptures"][0]["missing_translation"] == 200


async def test_corpus_status_ready(app_client, mock_all_db):
    mock_all_db.pg.fetch.return_value = [
        {
            "scripture_id": "scp_01TEST",
            "slug": "bhagavad-gita",
            "name": "Bhagavad Gita",
            "chapter_count": 18,
            "verse_count": 700,
            "content_count": 2100,
            "sanskrit_count": 700,
            "transliteration_count": 700,
            "translation_count": 700,
        }
    ]

    resp = await app_client.get("/api/v1/corpus/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ready"
    assert data["blockers"] == []
    assert data["scriptures"][0]["ready_for_search"] is True
    assert data["scriptures"][0]["ready_for_citation"] is True
