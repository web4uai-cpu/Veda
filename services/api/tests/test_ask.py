"""Tests for Phase 8: Ask and Research reasoning endpoints."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ============================================================================
# RLM service tests
# ============================================================================


async def test_generate_answer_no_api_key(monkeypatch):
    from services.rlm_service import generate_answer

    monkeypatch.setattr("services.rlm_service.settings.openrouter_api_key", "")
    result = await generate_answer("What is dharma?", [])
    assert "not configured" in result.answer
    assert result.model_used == "none"


async def test_generate_answer_no_evidence(monkeypatch):
    from services.rlm_service import generate_answer

    monkeypatch.setattr("services.rlm_service.settings.openrouter_api_key", "test-key")
    result = await generate_answer("What is dharma?", [])
    assert "No evidence" in result.answer


async def test_format_evidence():
    from services.rlm_service import _format_evidence
    from models.schemas import EvidencePacketResponse, CitationResponse

    evidence = [EvidencePacketResponse(
        packet_id="pkt_01",
        source_id="vrs_01",
        source_type="SCRIPTURE",
        title="BG 2.47",
        content="You have the right to perform your duty",
        citation=CitationResponse(
            citation_id="cit_01",
            source_type="SCRIPTURE",
            source_name="Bhagavad Gita",
            reference="BG.2.47",
            source_id="vrs_01",
            chapter=2,
            verse=47,
            confidence=0.95,
            evidence_level="A",
        ),
        score=0.9,
        retrieval_source="postgres.reference",
    )]

    formatted = _format_evidence(evidence)
    assert "BG.2.47" in formatted
    assert "Bhagavad Gita" in formatted
    assert "duty" in formatted


async def test_extract_citations():
    from services.rlm_service import _extract_citations

    text = "According to [BG.2.47], one should perform duty. [KU.1.2.20] also discusses this. See [BG.2.47] again."
    refs = _extract_citations(text)
    assert "BG.2.47" in refs
    assert "KU.1.2.20" in refs
    assert len(refs) == 2  # deduped


async def test_generate_research_no_api_key(monkeypatch):
    from services.rlm_service import generate_research_report

    monkeypatch.setattr("services.rlm_service.settings.openrouter_api_key", "")
    result = await generate_research_report("Compare karma yoga and jnana yoga", [])
    assert "not configured" in result.answer


# ============================================================================
# Ask endpoint tests
# ============================================================================


async def test_ask_endpoint_returns_answer(app_client, mock_all_db, monkeypatch):
    from models.schemas import SearchResponse, QueryUnderstanding, EvidencePacketResponse, CitationResponse
    from services.rlm_service import RLMResult

    search_resp = SearchResponse(
        query="What is dharma?",
        mode="quick",
        understanding=QueryUnderstanding(intent="concept", normalized_query="what is dharma"),
        results=[],
        total=0,
        query_time_ms=10.0,
        warnings=[],
    )
    monkeypatch.setattr("routers.ask.search_evidence", AsyncMock(return_value=search_resp))
    monkeypatch.setattr("routers.ask.generate_answer", AsyncMock(return_value=RLMResult(
        answer="Dharma means righteous duty.",
        cited_references=[],
        model_used="test-model",
    )))
    monkeypatch.setattr("routers.ask.resolve_scripture_citation_by_reference", AsyncMock(return_value=None))

    resp = await app_client.post("/api/v1/ask", json={"query": "What is dharma?"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["answer"] == "Dharma means righteous duty."
    assert data["model_used"] == "test-model"


async def test_ask_validates_cited_references(app_client, mock_all_db, monkeypatch):
    from models.schemas import SearchResponse, QueryUnderstanding, CitationResponse
    from services.rlm_service import RLMResult

    search_resp = SearchResponse(
        query="test", mode="quick",
        understanding=QueryUnderstanding(intent="concept", normalized_query="test"),
        results=[], total=0, query_time_ms=5.0,
    )
    monkeypatch.setattr("routers.ask.search_evidence", AsyncMock(return_value=search_resp))
    monkeypatch.setattr("routers.ask.generate_answer", AsyncMock(return_value=RLMResult(
        answer="See [BG.2.47] and [FAKE.1.1].",
        cited_references=["BG.2.47", "FAKE.1.1"],
        model_used="test",
    )))

    mock_resolve = AsyncMock(side_effect=[
        CitationResponse(
            citation_id="cit_01", source_type="SCRIPTURE", source_name="Bhagavad Gita",
            reference="BG.2.47", source_id="vrs_01", chapter=2, verse=47,
            confidence=0.95, evidence_level="A",
        ),
        None,  # FAKE.1.1 not found
    ])
    monkeypatch.setattr("routers.ask.resolve_scripture_citation_by_reference", mock_resolve)

    resp = await app_client.post("/api/v1/ask", json={"query": "test"})
    data = resp.json()
    assert len(data["citations"]) == 1
    assert data["citations"][0]["reference"] == "BG.2.47"
    assert any("FAKE.1.1" in w for w in data["warnings"])


async def test_research_endpoint(app_client, mock_all_db, monkeypatch):
    from models.schemas import SearchResponse, QueryUnderstanding
    from services.rlm_service import RLMResult

    search_resp = SearchResponse(
        query="test", mode="scholar",
        understanding=QueryUnderstanding(intent="research", normalized_query="test"),
        results=[], total=0, query_time_ms=5.0,
    )
    monkeypatch.setattr("routers.research.search_evidence", AsyncMock(return_value=search_resp))
    monkeypatch.setattr("routers.research.generate_research_report", AsyncMock(return_value=RLMResult(
        answer="## Summary\nDharma is complex.",
        cited_references=[],
        model_used="test",
    )))

    resp = await app_client.post("/api/v1/research", json={"query": "Compare karma and dharma"})
    assert resp.status_code == 200
    data = resp.json()
    assert "Dharma" in data["report"]
