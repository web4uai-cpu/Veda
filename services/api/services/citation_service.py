"""
VEDA — Citation Service
=========================
Validates source references and converts retrieved rows into citation objects.

This service is deliberately conservative: if a source cannot be verified, it
does not receive a citation.
"""

from __future__ import annotations

from core.ulid import generate_id
from db import postgres
from models.schemas import CitationResponse, EvidenceLevel, SourceType


SOURCE_QUALITY: dict[SourceType, float] = {
    "SCRIPTURE": 1.00,
    "COMMENTARY": 0.90,
    "SCHOLARLY_SOURCE": 0.80,
    "UPLOAD": 0.50,
    "AI_NOTE": 0.20,
}


def evidence_level_for_score(score: float) -> EvidenceLevel:
    """Map a confidence score to the VEDA evidence scale."""
    if score >= 0.95:
        return "A"
    if score >= 0.80:
        return "B"
    if score >= 0.60:
        return "C"
    if score >= 0.40:
        return "D"
    return "E"


def calculate_confidence(
    source_type: SourceType,
    retrieval_score: float,
    graph_score: float = 0.0,
    citation_strength: float = 1.0,
    agent_agreement: float = 1.0,
) -> float:
    """
    Calculate confidence using the weights from CITATION_ENGINE.md.

    Agent agreement defaults to neutral approval until the agent runtime exists.
    """
    source_quality = SOURCE_QUALITY[source_type]
    confidence = (
        (source_quality * 0.40)
        + (retrieval_score * 0.20)
        + (graph_score * 0.15)
        + (agent_agreement * 0.15)
        + (citation_strength * 0.10)
    )
    return round(min(max(confidence, 0.0), 1.0), 4)


async def resolve_scripture_citation(
    verse_id: str,
    retrieval_score: float,
    graph_score: float = 0.0,
) -> CitationResponse | None:
    """Verify a verse exists and return its canonical scripture citation."""
    row = await postgres.fetchrow(
        """
        SELECT v.id AS verse_id,
               v.canonical_reference,
               v.verse_number,
               c.chapter_number,
               s.name AS scripture_name
        FROM verses v
        JOIN scriptures s ON s.id = v.scripture_id
        LEFT JOIN chapters c ON c.id = v.chapter_id
        WHERE v.id = $1
        """,
        verse_id,
    )
    if not row:
        return None

    confidence = calculate_confidence(
        "SCRIPTURE",
        retrieval_score=retrieval_score,
        graph_score=graph_score,
        citation_strength=1.0,
    )
    return CitationResponse(
        citation_id=generate_id("cit"),
        source_type="SCRIPTURE",
        source_name=row["scripture_name"],
        reference=row["canonical_reference"],
        source_id=row["verse_id"],
        chapter=row["chapter_number"],
        verse=row["verse_number"],
        confidence=confidence,
        evidence_level=evidence_level_for_score(confidence),
    )
