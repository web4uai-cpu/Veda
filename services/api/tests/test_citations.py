"""Tests for the citation router and citation service."""

from __future__ import annotations

from services.citation_service import (
    calculate_confidence,
    evidence_level_for_score,
)


def test_evidence_level_a():
    assert evidence_level_for_score(0.95) == "A"
    assert evidence_level_for_score(1.0) == "A"


def test_evidence_level_b():
    assert evidence_level_for_score(0.80) == "B"
    assert evidence_level_for_score(0.94) == "B"


def test_evidence_level_c():
    assert evidence_level_for_score(0.60) == "C"
    assert evidence_level_for_score(0.79) == "C"


def test_evidence_level_d():
    assert evidence_level_for_score(0.40) == "D"
    assert evidence_level_for_score(0.59) == "D"


def test_evidence_level_e():
    assert evidence_level_for_score(0.39) == "E"
    assert evidence_level_for_score(0.0) == "E"


def test_confidence_scripture_high():
    score = calculate_confidence("SCRIPTURE", retrieval_score=1.0, graph_score=1.0)
    assert score >= 0.85


def test_confidence_upload_low():
    score = calculate_confidence("UPLOAD", retrieval_score=0.5, graph_score=0.0)
    assert score < 0.60


def test_confidence_bounds():
    score = calculate_confidence("SCRIPTURE", retrieval_score=1.0, graph_score=1.0, citation_strength=1.0, agent_agreement=1.0)
    assert 0.0 <= score <= 1.0


async def test_resolve_citation_found(app_client, mock_all_db, make_verse_row):
    id_row = {"id": "vrs_01HX0000000000000000000003"}
    full_row = {
        "verse_id": "vrs_01HX0000000000000000000003",
        "canonical_reference": "BG.2.47",
        "verse_number": 47,
        "chapter_number": 2,
        "scripture_name": "Bhagavad Gita",
    }
    # First call: resolve_by_reference looks up id, second call: resolve gets full row
    mock_all_db.pg.fetchrow.side_effect = [id_row, full_row]

    resp = await app_client.post(
        "/api/v1/citations/resolve",
        json={"reference": "BG.2.47", "retrieval_score": 0.9},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["resolved"] is True
    assert data["citation"] is not None
    assert data["citation"]["reference"] == "BG.2.47"


async def test_resolve_citation_not_found(app_client, mock_all_db):
    mock_all_db.pg.fetchrow.return_value = None

    resp = await app_client.post(
        "/api/v1/citations/resolve",
        json={"reference": "BG.99.99"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["resolved"] is False


async def test_validate_citation_approved(app_client, mock_all_db):
    id_row = {"id": "vrs_01HX0000000000000000000003"}
    full_row = {
        "verse_id": "vrs_01HX0000000000000000000003",
        "canonical_reference": "BG.2.47",
        "verse_number": 47,
        "chapter_number": 2,
        "scripture_name": "Bhagavad Gita",
    }
    mock_all_db.pg.fetchrow.side_effect = [id_row, full_row]

    resp = await app_client.post(
        "/api/v1/citations/validate",
        json={
            "reference": "BG.2.47",
            "source_type": "SCRIPTURE",
            "retrieval_score": 0.9,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "approved"
    assert data["valid"] is True


async def test_validate_citation_rejected_non_scripture(app_client, mock_all_db):
    resp = await app_client.post(
        "/api/v1/citations/validate",
        json={
            "reference": "user-note-123",
            "source_type": "UPLOAD",
            "retrieval_score": 0.5,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "rejected"
    assert data["valid"] is False
