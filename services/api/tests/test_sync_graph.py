"""Tests for Phase 3B: sync_graph, detect_concepts, validate_graph."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch, call

import pytest


# ============================================================================
# sync_graph tests
# ============================================================================


@pytest.fixture
def mock_pg():
    """Mock PostgreSQL fetch for sync tests."""
    return AsyncMock()


@pytest.fixture
def mock_neo4j_write():
    """Mock Neo4j write_query."""
    return AsyncMock(return_value=[])


@pytest.fixture
def mock_neo4j_read():
    """Mock Neo4j read_query."""
    return AsyncMock(return_value=[])


@pytest.fixture
def patch_sync(monkeypatch, mock_pg, mock_neo4j_write, mock_neo4j_read):
    """Patch all DB functions for sync_graph module."""
    monkeypatch.setattr("services.sync_graph.fetch", mock_pg)
    monkeypatch.setattr("services.sync_graph.write_query", mock_neo4j_write)
    monkeypatch.setattr("services.sync_graph.read_query", mock_neo4j_read)
    return mock_pg, mock_neo4j_write, mock_neo4j_read


async def test_sync_scriptures(patch_sync):
    from services.sync_graph import sync_scriptures
    pg, neo4j_write, _ = patch_sync

    pg.return_value = [
        {"id": "scp_01", "slug": "bhagavad-gita", "name": "Bhagavad Gita",
         "sanskrit_name": "भगवद्गीता", "category": "gita", "language": "sanskrit"},
    ]
    neo4j_write.return_value = [{"id": "scp_01", "existed": True}]

    count = await sync_scriptures()
    assert count == 1
    assert neo4j_write.call_count == 1
    cypher = neo4j_write.call_args[0][0]
    assert "MERGE (s:Scripture {id: $id})" in cypher


async def test_sync_books(patch_sync):
    from services.sync_graph import sync_books
    pg, neo4j_write, _ = patch_sync

    pg.return_value = [
        {"id": "bok_01", "scripture_id": "scp_01", "name": "Bhagavad Gita",
         "sanskrit_name": "भगवद्गीता", "position": 1},
    ]

    count = await sync_books()
    assert count == 1
    cypher = neo4j_write.call_args[0][0]
    assert "PART_OF" in cypher


async def test_sync_chapters(patch_sync):
    from services.sync_graph import sync_chapters
    pg, neo4j_write, _ = patch_sync

    pg.return_value = [
        {"id": "chp_01", "book_id": "bok_01", "scripture_id": "scp_01",
         "chapter_number": 1, "title": "Arjuna Vishada Yoga",
         "sanskrit_title": "अर्जुनविषादयोग", "summary": "Arjuna's grief"},
    ]

    count = await sync_chapters()
    assert count == 1
    cypher = neo4j_write.call_args[0][0]
    assert "MERGE (c:Chapter {id: $id})" in cypher
    assert "PART_OF" in cypher


async def test_sync_verses_batched(patch_sync, monkeypatch):
    from services.sync_graph import sync_verses
    pg, neo4j_write, _ = patch_sync

    monkeypatch.setattr("services.sync_graph._count_pg_verses", AsyncMock(return_value=3))

    pg.return_value = [
        {"id": f"vrs_0{i}", "scripture_id": "scp_01", "chapter_id": "chp_01",
         "verse_number": i, "canonical_reference": f"BG.1.{i}"}
        for i in range(1, 4)
    ]

    count = await sync_verses()
    assert count == 3
    assert neo4j_write.call_count >= 1
    cypher = neo4j_write.call_args[0][0]
    assert "UNWIND $batch" in cypher
    assert "PART_OF" in cypher


async def test_sync_verses_empty(patch_sync, monkeypatch):
    from services.sync_graph import sync_verses
    pg, neo4j_write, _ = patch_sync

    monkeypatch.setattr("services.sync_graph._count_pg_verses", AsyncMock(return_value=0))
    pg.return_value = []

    count = await sync_verses()
    assert count == 0
    assert neo4j_write.call_count == 0


# ============================================================================
# detect_concepts tests
# ============================================================================


def test_detect_concepts_in_text():
    from services.detect_concepts import detect_concepts_in_text, KEYWORD_MAP

    text = "Perform your duty without attachment to results — this is karma yoga."
    found = detect_concepts_in_text(text, KEYWORD_MAP)
    assert "dharma" in found  # "duty" maps to dharma
    assert "karma-yoga" in found  # "karma yoga" maps
    assert "karma" in found  # "karma" present in "karma yoga"


def test_detect_concepts_empty_text():
    from services.detect_concepts import detect_concepts_in_text, KEYWORD_MAP

    found = detect_concepts_in_text("", KEYWORD_MAP)
    assert found == {}


def test_detect_sanskrit_concepts():
    from services.detect_concepts import detect_sanskrit_concepts

    text = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
    found = detect_sanskrit_concepts(text)
    assert "karma" in found
    assert found["karma"] == 0.85


def test_detect_sanskrit_brahman():
    from services.detect_concepts import detect_sanskrit_concepts

    text = "ब्रह्मार्पणं ब्रह्म हविः"
    found = detect_sanskrit_concepts(text)
    assert "brahman" in found


def test_extract_chapter_number():
    from services.detect_concepts import extract_chapter_number

    assert extract_chapter_number("BG.2.47") == 2
    assert extract_chapter_number("BG.18.66") == 18
    assert extract_chapter_number("BG") is None
    assert extract_chapter_number("") is None


def test_chapter_concepts_coverage():
    from services.detect_concepts import CHAPTER_CONCEPTS

    assert len(CHAPTER_CONCEPTS) == 18
    for ch in range(1, 19):
        assert ch in CHAPTER_CONCEPTS
        assert len(CHAPTER_CONCEPTS[ch]) >= 1


async def test_detect_and_link(monkeypatch):
    from services.detect_concepts import detect_and_link

    mock_fetch = AsyncMock(return_value=[
        {"verse_id": "vrs_01", "canonical_reference": "BG.2.47",
         "content": "You have the right to perform your duty, but never to the fruits.",
         "content_type": "translation"},
        {"verse_id": "vrs_01", "canonical_reference": "BG.2.47",
         "content": "कर्मण्येवाधिकारस्ते",
         "content_type": "sanskrit"},
    ])
    mock_write = AsyncMock(return_value=[{"created": 5}])

    monkeypatch.setattr("services.detect_concepts.fetch", mock_fetch)
    monkeypatch.setattr("services.detect_concepts.write_query", mock_write)

    result = await detect_and_link()
    assert result["verses_scanned"] == 1
    assert result["relationships_written"] >= 1
    assert mock_write.call_count >= 1


# ============================================================================
# validate_graph tests
# ============================================================================


async def test_validate_counts(monkeypatch):
    from services.validate_graph import validate_counts

    mock_fetchval = AsyncMock(side_effect=[1, 1, 18, 700])
    mock_read = AsyncMock(side_effect=[
        [{"total": 1}],
        [{"total": 1}],
        [{"total": 18}],
        [{"total": 700}],
    ])
    monkeypatch.setattr("services.validate_graph.fetchval", mock_fetchval)
    monkeypatch.setattr("services.validate_graph.read_query", mock_read)

    checks = await validate_counts()
    assert len(checks) == 4
    assert all(c["match"] for c in checks)


async def test_validate_counts_mismatch(monkeypatch):
    from services.validate_graph import validate_counts

    mock_fetchval = AsyncMock(side_effect=[1, 1, 18, 700])
    mock_read = AsyncMock(side_effect=[
        [{"total": 1}],
        [{"total": 1}],
        [{"total": 18}],
        [{"total": 500}],  # mismatch
    ])
    monkeypatch.setattr("services.validate_graph.fetchval", mock_fetchval)
    monkeypatch.setattr("services.validate_graph.read_query", mock_read)

    checks = await validate_counts()
    assert checks[3]["match"] is False


async def test_validate_hierarchy(monkeypatch):
    from services.validate_graph import validate_hierarchy

    mock_fetchval = AsyncMock(side_effect=[700, 18, 1])
    mock_read = AsyncMock(side_effect=[
        [{"linked": 700}], [{"orphans": 0}],
        [{"linked": 18}], [{"orphans": 0}],
        [{"linked": 1}], [{"orphans": 0}],
    ])
    monkeypatch.setattr("services.validate_graph.fetchval", mock_fetchval)
    monkeypatch.setattr("services.validate_graph.read_query", mock_read)

    checks = await validate_hierarchy()
    assert len(checks) == 3
    assert all(c["match"] for c in checks)


async def test_validate_mentions(monkeypatch):
    from services.validate_graph import validate_mentions

    mock_read = AsyncMock(side_effect=[
        [{"total": 700}],  # count_neo4j("Verse")
        [{"with_concepts": 650}],  # DISTINCT verses with concepts
        [{"total": 3200}],  # count MENTIONS rels
    ])
    monkeypatch.setattr("services.validate_graph.read_query", mock_read)

    result = await validate_mentions()
    assert result["total_verses"] == 700
    assert result["verses_with_concepts"] == 650
    assert result["coverage_pct"] == 92.9
    assert result["total_mentions"] == 3200


async def test_validate_concepts(monkeypatch):
    from services.validate_graph import validate_concepts

    mock_read = AsyncMock(return_value=[
        {"slug": "dharma", "name": "Dharma", "verse_count": 120},
        {"slug": "karma", "name": "Karma", "verse_count": 90},
        {"slug": "ahimsa", "name": "Ahimsa", "verse_count": 0},
    ])
    monkeypatch.setattr("services.validate_graph.read_query", mock_read)

    result = await validate_concepts()
    assert result["total_concepts"] == 3
    assert result["connected"] == 2
    assert "ahimsa" in result["disconnected"]
