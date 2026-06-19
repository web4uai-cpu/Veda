"""Tests for the search router and search service."""

from __future__ import annotations

from services.search_service import understand_query
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


async def test_search_endpoint_returns_evidence(app_client, mock_all_db, make_verse_row, make_verse_content_row):
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
    # fetch is called for reference lookup (returns content rows), then keyword (returns [])
    mock_all_db.pg.fetch.side_effect = [[content_row], []]
    # fetchrow is called by citation service to resolve the verse
    mock_all_db.pg.fetchrow.return_value = verse_row

    resp = await app_client.post(
        "/api/v1/search",
        json={"query": "BG.2.47", "mode": "quick", "limit": 5},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert "understanding" in data
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
