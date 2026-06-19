"""Tests for the search router and search service."""

from __future__ import annotations

from services.search_service import understand_query, _fuse_candidates, Candidate
from models.schemas import SearchRequest


async def test_search_by_reference_intent(mock_all_db):
    request = SearchRequest(query="BG.2.47", mode="quick")
    understanding = understand_query(request)
    assert understanding.intent == "verse"
    assert understanding.canonical_reference == "BG.2.47"


async def test_search_by_concept_intent(mock_all_db):
    request = SearchRequest(query="What is moksha?", mode="quick")
    understanding = understand_query(request)
    assert understanding.intent == "concept"
    assert "moksha" in understanding.concepts


async def test_search_comparison_intent(mock_all_db):
    request = SearchRequest(query="Compare dharma vs karma", mode="scholar")
    understanding = understand_query(request)
    assert understanding.intent == "comparison"


async def test_search_mode_affects_graph_depth(mock_all_db):
    quick = SearchRequest(query="What is dharma?", mode="quick")
    research = SearchRequest(query="What is dharma?", mode="research")

    quick_u = understand_query(quick)
    research_u = understand_query(research)
    assert research_u.graph_depth > quick_u.graph_depth


async def test_search_endpoint_returns_evidence(app_client, mock_all_db):
    verse_row = {
        "verse_id": "vrs_01HX0000000000000000000003",
        "canonical_reference": "BG.2.47",
        "verse_number": 47,
        "chapter_number": 2,
        "scripture_name": "Bhagavad Gita",
    }
    content_row = {
        "verse_id": "vrs_01HX0000000000000000000003",
        "canonical_reference": "BG.2.47",
        "content": "You have a right to action alone",
        "content_type": "translation",
        "source": "Swami Sivananda",
    }
    mock_all_db.pg.fetch.side_effect = [[content_row], []]
    mock_all_db.pg.fetchrow.return_value = verse_row

    resp = await app_client.post(
        "/api/v1/search",
        json={"query": "BG.2.47", "mode": "quick", "limit": 5},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert data["understanding"]["intent"] == "verse"
    assert data["query_time_ms"] >= 0


async def test_search_empty_results(app_client, mock_all_db):
    mock_all_db.pg.fetchrow.return_value = None
    mock_all_db.pg.fetch.return_value = []
    mock_all_db.neo4j.read_query.return_value = []

    resp = await app_client.post(
        "/api/v1/search",
        json={"query": "obscure nonexistent term", "mode": "quick", "limit": 5},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0


# ---------------------------------------------------------------------------
# Qdrant + OpenSearch integration tests
# ---------------------------------------------------------------------------


async def test_search_graceful_when_qdrant_unavailable(app_client, mock_all_db):
    """Search should still work when Qdrant is down."""
    mock_all_db.pg.fetchrow.return_value = None
    mock_all_db.pg.fetch.return_value = []

    resp = await app_client.post(
        "/api/v1/search",
        json={"query": "meaning of life", "mode": "quick", "limit": 5},
    )
    assert resp.status_code == 200


async def test_search_graceful_when_opensearch_unavailable(app_client, mock_all_db):
    """Search should still work when OpenSearch is down."""
    mock_all_db.pg.fetchrow.return_value = None
    mock_all_db.pg.fetch.return_value = []

    resp = await app_client.post(
        "/api/v1/search",
        json={"query": "dharma and duty", "mode": "scholar", "limit": 5},
    )
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Fusion ranking unit tests
# ---------------------------------------------------------------------------


def test_fusion_ranking_exact_reference_wins():
    """Exact reference candidates should always rank first."""
    candidates = [
        Candidate("v1", "BG.2.47", "exact match", 1.0, "postgres.reference"),
        Candidate("v2", "BG.3.1", "keyword match", 0.8, "postgres.keyword"),
        Candidate("v3", "BG.4.7", "concept match", 0.82, "neo4j.concept"),
    ]
    ranked = _fuse_candidates(candidates)
    assert ranked[0].source_id == "v1"


def test_fusion_ranking_deduplicates():
    """Same source_id from multiple paths should be merged."""
    candidates = [
        Candidate("v1", "BG.2.47", "from keyword", 0.8, "postgres.keyword"),
        Candidate("v1", "BG.2.47", "from concept", 0.85, "neo4j.concept"),
    ]
    ranked = _fuse_candidates(candidates)
    assert len(ranked) == 1
    assert ranked[0].source_id == "v1"


def test_fusion_ranking_semantic_outweighs_keyword():
    """Qdrant semantic (weight 0.40) should outrank keyword (weight 0.15) at same position."""
    candidates = [
        Candidate("v1", "A", "keyword", 0.8, "postgres.keyword"),
        Candidate("v2", "B", "semantic", 0.8, "qdrant.semantic"),
    ]
    ranked = _fuse_candidates(candidates)
    assert ranked[0].source_id == "v2"


def test_fusion_ranking_empty_input():
    """Empty candidate list should return empty."""
    assert _fuse_candidates([]) == []
